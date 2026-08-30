import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCertifyLocation,
  useDecertifyLocation,
  useGrantSkill,
  useRevokeSkill,
  useStaffLocations,
  useStaffSkills,
} from '@/hooks/use-certifications'
import { useLocations } from '@/hooks/use-locations'
import { useSkills } from '@/hooks/use-skills'
import type { User } from '@/types/domain'

interface CertificationsDialogProps {
  staff: User | null
  onOpenChange: (open: boolean) => void
}

export function CertificationsDialog({ staff, onOpenChange }: CertificationsDialogProps) {
  const staffId = staff?.id ?? ''
  const [skillToAdd, setSkillToAdd] = useState('')
  const [locationToAdd, setLocationToAdd] = useState('')

  const { data: allSkills } = useSkills()
  const { data: allLocations } = useLocations()
  const staffSkills = useStaffSkills(staffId || undefined)
  const staffLocations = useStaffLocations(staffId || undefined)

  const grantSkill = useGrantSkill(staffId)
  const revokeSkill = useRevokeSkill(staffId)
  const certifyLocation = useCertifyLocation(staffId)
  const decertifyLocation = useDecertifyLocation(staffId)

  const activeLocationCerts = (staffLocations.data ?? []).filter((c) => !c.decertifiedAt)
  const heldSkillIds = new Set((staffSkills.data ?? []).map((s) => s.skillId))
  const certifiedLocationIds = new Set(activeLocationCerts.map((c) => c.locationId))

  const availableSkills = (allSkills ?? []).filter((s) => !heldSkillIds.has(s.id))
  const availableLocations = (allLocations ?? []).filter((l) => !certifiedLocationIds.has(l.id))

  return (
    <Dialog open={!!staff} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{staff ? `${staff.firstName} ${staff.lastName}` : 'Certifications'}</DialogTitle>
          <DialogDescription>Skills and locations this staff member is certified for.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(staffSkills.data ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No skills yet.</p>
              )}
              {staffSkills.data?.map((s) => (
                <Badge key={s.id} variant="secondary" className="gap-1 pr-1">
                  {s.skill?.name ?? s.skillId}
                  <button
                    type="button"
                    aria-label={`Remove ${s.skill?.name ?? 'skill'}`}
                    onClick={() => revokeSkill.mutate(s.skillId)}
                    className="rounded-sm hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={skillToAdd} onValueChange={setSkillToAdd}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Add a skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!skillToAdd || grantSkill.isPending}
                onClick={() => {
                  grantSkill.mutate(skillToAdd, { onSuccess: () => setSkillToAdd('') })
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Location certifications</p>
            <div className="flex flex-wrap gap-2">
              {activeLocationCerts.length === 0 && (
                <p className="text-xs text-muted-foreground">Not certified at any location yet.</p>
              )}
              {activeLocationCerts.map((c) => (
                <Badge key={c.id} variant="secondary" className="gap-1 pr-1">
                  {c.location?.name ?? c.locationId}
                  <button
                    type="button"
                    aria-label={`Remove ${c.location?.name ?? 'location'}`}
                    onClick={() => decertifyLocation.mutate(c.locationId)}
                    className="rounded-sm hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={locationToAdd} onValueChange={setLocationToAdd}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Certify a location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!locationToAdd || certifyLocation.isPending}
                onClick={() => {
                  certifyLocation.mutate(locationToAdd, { onSuccess: () => setLocationToAdd('') })
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
