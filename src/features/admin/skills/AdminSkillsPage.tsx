import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/layout/ErrorState'
import { useCreateSkill, useSkills } from '@/hooks/use-skills'

export function AdminSkillsPage() {
  const { data: skills, isLoading, isError, refetch } = useSkills()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createSkill = useCreateSkill()

  function handleOpenChange(next: boolean) {
    if (!next) setName('')
    setOpen(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground">The skills shifts can require and staff can be certified in.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New skill
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-10" />
      ) : isError ? (
        <ErrorState message="Could not load skills." onRetry={() => refetch()} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill) => (
            <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm">
              {skill.name}
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New skill</DialogTitle>
            <DialogDescription>Add a skill that shifts can require (e.g. "bartender").</DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Skill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={name.trim().length < 2 || createSkill.isPending}
              onClick={() => {
                createSkill.mutate(name.trim(), { onSuccess: () => handleOpenChange(false) })
              }}
            >
              {createSkill.isPending && <Loader2 className="animate-spin" />}
              Add skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
