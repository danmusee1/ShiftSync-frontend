import { useEffect } from 'react'
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
import { useCreateLocation, useUpdateLocation } from '@/hooks/use-locations'
import type { Location } from '@/types/domain'
import { defaultLocationValues, locationSchema, type LocationFormValues } from './location-schema'

interface LocationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set, edits this location instead of creating a new one. */
  location?: Location | null
}

export function LocationFormDialog({ open, onOpenChange, location }: LocationFormDialogProps) {
  const isEditing = !!location
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation(location?.id ?? '')

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultLocationValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      location
        ? { name: location.name, timezone: location.timezone, address: location.address ?? '' }
        : defaultLocationValues,
    )
  }, [open, location, form])

  function onSubmit(values: LocationFormValues) {
    const payload = { ...values, address: values.address || undefined }
    const mutation = isEditing ? updateLocation : createLocation
    mutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  const isPending = createLocation.isPending || updateLocation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit location' : 'New location'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this location.' : 'Add a new Coastal Eats location.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="America/Los_Angeles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                {isEditing ? 'Save changes' : 'Create location'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
