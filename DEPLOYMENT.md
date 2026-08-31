# Deployment & Infrastructure

How the ShiftSync frontend is built, shipped, and run in production — the Docker
architecture, the CI/CD pipeline, and the operational commands for running it yourself.

> This doc is written to be safe to publish: it describes the architecture and the
> commands, not any specific server, domain, or credential. Wherever a real value is
> needed (VPS IP, domain, SSH user, deploy path) it's shown as a placeholder — substitute
> your own.

## Architecture at a glance

```
GitHub (development / main)
        │  push
        ▼
GitHub Actions (.github/workflows/deploy.yml)
  ├─ validate  (every push to development or main): typecheck, lint
  ├─ build     (push to main only): docker build → docker save → upload artifact
  └─ deploy    (push to main only): ship the image tarball to the server over SSH,
               load it, swap the running container, health-check
        │
        ▼
Server
  <deploy-path>/
    (docker images loaded here, no source checkout needed, no .env — this
     container has no server-side secrets, it's a static bundle)

  docker run shiftsync-frontend -p 127.0.0.1:<port>:80 --restart unless-stopped
    └─ nginx inside the container serves the pre-built Vite bundle, SPA-aware

  reverse proxy (your domain) ──TLS──▶ 127.0.0.1:<port> ──▶ container
                                                                │
  (in the browser, once loaded)                                │
  your frontend domain  ──── XHR/WebSocket ────▶  your API domain
```

The frontend is a fully static build — the container serves pre-built HTML/CSS/JS, and
carries no backend URL secret, no database credentials, nothing sensitive at all. The API
base URL is baked into the bundle at *build* time (see below), and all actual
frontend↔backend communication happens client-side, in the browser.

## The container

`Dockerfile` is a two-stage build:

1. **`builder`** — `node:22-bookworm-slim`, installs all dependencies (`npm install`,
   including devDependencies — Vite/TypeScript are needed to build), then runs
   `npm run build` (`tsc -b && vite build`), producing static output in `dist/`.
2. **`runtime`** — `nginx:1.27-alpine`, copies in `nginx.conf` and the built `dist/`
   folder. Nothing else — no Node, no source, no `node_modules` in the final image.

**API URL is a build-time concern, not a runtime one.** `src/api/client.ts` reads it from
`VITE_API_URL` at build time, falling back to a sane default if it's unset:

```ts
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'https://your-api-domain.example'
```

Vite bakes `import.meta.env.*` values into the bundle at **build time**, not runtime — so
whatever `VITE_API_URL` is (or isn't) set to when you run `docker build` is permanent for
that image. There's no way to point an already-built image at a different API without
rebuilding it. Set the fallback above to your own production API URL, or pass
`--build-arg VITE_API_URL=...` (wired through the Dockerfile via `ARG`/`ENV`) if you'd
rather not hardcode a fallback at all.

The local dev `.env` (which sets `VITE_API_URL` to a local dev backend) is excluded from
the build context via `.dockerignore`, so it can never leak into a production image even
if you forget it's there.

`nginx.conf` handles SPA routing: `try_files $uri $uri/ /index.html;` means any path that
isn't a real static file falls back to `index.html`, so client-side routes survive a hard
refresh or a shared deep link — nginx doesn't know about your router, so every unmatched
path falls back and the router takes it from there. Hashed build assets get a long cache
lifetime; `index.html` itself is deliberately excluded from that so a new deploy is picked
up on next load instead of being cached stale.

**Networking:** the container runs on ordinary Docker bridge networking, published only to
`127.0.0.1:<port>` — never directly to the internet. Whatever reverse proxy/TLS
termination you're already running (nginx, Caddy, Traefik, a managed load balancer) is
what should actually face the public internet and proxy to that loopback port.

Recommended: tag images by git commit SHA (`shiftsync-frontend:<sha>`) rather than
`latest`, so you can always tell exactly which commit is live and roll back to a specific
previous one.

## CI/CD pipeline (`.github/workflows/deploy.yml`)

**Branch flow:**
- `development` — every push runs `validate` only (typecheck, lint). No deploy.
- `main` — push (or a merge from `development`) runs `validate` → `build` → `deploy`.
- `pull_request` targeting `main` also runs `validate`.

**Required GitHub secrets** (repo Settings → Secrets and variables → Actions):

| Secret | Purpose |
| --- | --- |
| `SSH_PRIVATE_KEY` | private key for a deploy-only SSH user on your server |
| `VPS_HOST` | your server's IP or hostname |
| `VPS_PORT` | SSH port (commonly `22`) |
| `VPS_USER` | the SSH/deploy user |
| `FRONTEND_DEPLOY_PATH` | absolute path on the server to stage the image tarball (no trailing slash) |

**Deploy steps, in order:**
1. Download the image tarball artifact built in the previous stage.
2. `rsync` it to the server over SSH.
3. `docker load` the image.
4. Stop/remove the previous container, start the new one (`--restart unless-stopped`,
   bound to loopback, log rotation capped at 30MB).
5. Poll the container's health for up to 30 seconds; fail the deploy loudly if it never
   comes up.
6. Prune old images, keeping the most recent few for manual rollback.

If you're deploying to a box that also hosts other projects, give this deployment its own
subfolder (not a shared root) and its own port, and make sure your reverse proxy's
server-name matching is an **exact match** for your frontend's domain rather than a
wildcard — an exact match always takes precedence over a wildcard/catch-all block,
regardless of file load order.

## Manual deploy (no CI)

```bash
# from the project root, locally
docker build -t shiftsync-frontend:<tag> .
docker save shiftsync-frontend:<tag> | gzip > shiftsync-frontend.tar.gz
scp shiftsync-frontend.tar.gz <user>@<host>:<deploy-path>/

ssh <user>@<host>
  cd <deploy-path>
  docker load < shiftsync-frontend.tar.gz && rm shiftsync-frontend.tar.gz
  docker rm -f shiftsync-frontend 2>/dev/null || true
  docker run -d --name shiftsync-frontend --restart unless-stopped \
    --log-opt max-size=10m --log-opt max-file=3 \
    -p 127.0.0.1:<port>:80 shiftsync-frontend:<tag>
```

## Operational commands

**Logs:**
```bash
docker logs shiftsync-frontend                # full history (bounded — see below)
docker logs -f shiftsync-frontend             # follow live
docker logs --tail 100 shiftsync-frontend     # last 100 lines
```
Capped at 30MB total (`--log-opt max-size=10m --log-opt max-file=3`) so nginx
access/error logs can't grow the disk unbounded.

**Status & health:**
```bash
docker ps --filter name=shiftsync-frontend
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:<port>/
docker inspect shiftsync-frontend --format \
  'Image={{.Config.Image}} Restart={{.HostConfig.RestartPolicy.Name}} Started={{.State.StartedAt}}'
```

**Roll back to a previous image:**
```bash
docker images shiftsync-frontend                   # list available tags
docker rm -f shiftsync-frontend
docker run -d --name shiftsync-frontend --restart unless-stopped \
  --log-opt max-size=10m --log-opt max-file=3 \
  -p 127.0.0.1:<port>:80 shiftsync-frontend:<previous-sha>
```

## Known gotchas (things that actually broke, and why)

- **A clean `npm install` can fail with an `ERESOLVE` peer conflict** if a devDependency
  (e.g. a codegen tool) pins an older peer range for a package the rest of the project has
  since upgraded (e.g. TypeScript). It can look fine locally because an existing
  `node_modules` masks it, then fail immediately on any genuinely clean install — a Docker
  build, CI, or a fresh clone. Fix it with a `package.json` `overrides` entry pinning the
  offending package's internal dependency to match the root version, rather than reaching
  for `--legacy-peer-deps` (which silently suppresses *all* future peer conflicts, not
  just the one you found):
  ```json
  "overrides": { "some-dev-tool": { "typescript": "$typescript" } }
  ```

- **A CI deploy step can fail with `rsync: mkstemp "/.<file>" failed: Permission denied`**
  if a required secret (e.g. the deploy-path secret) isn't set — an unset GitHub Actions
  secret reference evaluates to an empty string, so a path built as
  `${{ secrets.SOME_PATH }}/` silently becomes just `/`, and rsync tries to write into the
  filesystem root. The deploy user correctly gets denied — but the fix is adding the
  missing secret, not loosening permissions. GitHub Actions secrets are per-repository, so
  if you have a companion backend repo deploying to the same server, its secrets don't
  carry over automatically — you have to add them again in this repo.

- **Never bake a non-production API URL into a production image "temporarily."** Since the
  URL is compiled into the bundle at build time, a wrong value looks completely normal
  until an actual API call fires in someone's browser — there's no runtime check that
  catches it, and every deploy from that branch ships broken until someone notices and
  rebuilds correctly.
