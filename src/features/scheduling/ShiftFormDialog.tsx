import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSkills } from '@/hooks/use-skills'
import { localDateOf, localTimeToUtcIso } from '@/lib/time'
import type { Shift } from '@/types/domain'
import { useCreateShift, useUpdateShift } from './hooks/use-shifts'
import { defaultShiftFormValues, shiftFormSchema, type ShiftFormValues } from './shift-schema'

interface ShiftFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleWeekId: string
  locationTimezone: string
  /** Pre-filled date (YYYY-MM-DD) when creating a shift from a specific day column. */
  defaultDate?: string
  /** When set, edits this shift instead of creating a new one. */
  shift?: Shift
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  scheduleWeekId,
  locationTimezone,
  defaultDate,
  shift,
}: ShiftFormDialogProps) {
  const isEditing = !!shift
  const { data: skills, isLoading: skillsLoading } = useSkills()
  const createShift = useCreateShift(scheduleWeekId)
  const updateShift = useUpdateShift(scheduleWeekId, shift?.id ?? '')

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      ...defaultShiftFormValues,
      date: defaultDate ?? '',
      requiredSkillId: '',
    },
  })

  // Reset the form whenever the dialog opens for a (possibly different) shift.
  useEffect(() => {
    if (!open) return
    if (shift) {
      const startDate = localDateOf(shift.startAt, locationTimezone)
      const endDate = localDateOf(shift.endAt, locationTimezone)
      form.reset({
        date: startDate,
        startTime: formatHHmm(shift.startAt, locationTimezone),
        endTime: formatHHmm(shift.endAt, locationTimezone),
        endsNextDay: endDate !== startDate,
        requiredSkillId: shift.requiredSkillId,
        headcountNeeded: String(shift.headcountNeeded),
        notes: shift.notes ?? '',
      })
    } else {
      form.reset({ ...defaultShiftFormValues, date: defaultDate ?? '', requiredSkillId: '' })
    }
  }, [open, shift, defaultDate, locationTimezone, form])

  function onSubmit(values: ShiftFormValues) {
    const endDate = values.endsNextDay ? shiftNextDay(values.date) : values.date
    const payload = {
      startAt: localTimeToUtcIso(values.date, values.startTime, locationTimezone),
      endAt: localTimeToUtcIso(endDate, values.endTime, locationTimezone),
      requiredSkillId: values.requiredSkillId,
      headcountNeeded: Number(values.headcountNeeded),
      notes: values.notes || undefined,
    }

    const mutation = isEditing ? updateShift : createShift
    mutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  const isPending = createShift.isPending || updateShift.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit shift' : 'New shift'}</DialogTitle>
          <DialogDescription>Times are in the location's timezone ({locationTimezone}).</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endsNextDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Overnight shift (ends the next calendar day)
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiredSkillId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required skill</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={skillsLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a skill" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {skills?.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headcountNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headcount needed</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isEditing ? 'Save changes' : 'Create shift'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function formatHHmm(instant: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(instant))
}

function shiftNextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + 1))
  return date.toISOString().slice(0, 10)
}
