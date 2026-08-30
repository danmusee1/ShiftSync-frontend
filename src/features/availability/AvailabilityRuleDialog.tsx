import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
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
import { useCreateAvailabilityRule } from '@/hooks/use-availability'
import { WEEKDAY_LABELS } from '@/lib/time'
import {
  availabilityRuleSchema,
  defaultAvailabilityRuleValues,
  type AvailabilityRuleFormValues,
} from './availability-schema'

interface AvailabilityRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffId: string
}

export function AvailabilityRuleDialog({ open, onOpenChange, staffId }: AvailabilityRuleDialogProps) {
  const createRule = useCreateAvailabilityRule(staffId)

  const form = useForm<AvailabilityRuleFormValues>({
    resolver: zodResolver(availabilityRuleSchema),
    defaultValues: defaultAvailabilityRuleValues,
  })

  function handleOpenChange(next: boolean) {
    if (!next) form.reset(defaultAvailabilityRuleValues)
    onOpenChange(next)
  }

  function onSubmit(values: AvailabilityRuleFormValues) {
    createRule.mutate(
      { dayOfWeek: Number(values.dayOfWeek), startTime: values.startTime, endTime: values.endTime },
      { onSuccess: () => handleOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add availability window</DialogTitle>
          <DialogDescription>A recurring window you're available to be scheduled, every week.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of week</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WEEKDAY_LABELS.map((label, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRule.isPending}>
                {createRule.isPending && <Loader2 className="animate-spin" />}
                Add window
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
