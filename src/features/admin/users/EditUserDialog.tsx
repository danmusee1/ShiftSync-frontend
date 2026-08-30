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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateUser } from '@/hooks/use-users'
import type { User } from '@/types/domain'
import { updateUserSchema, type UpdateUserFormValues } from './user-schema'

interface EditUserDialogProps {
  user: User | null
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, onOpenChange }: EditUserDialogProps) {
  const updateUser = useUpdateUser(user?.id ?? '')

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      role: 'STAFF',
      homeTimezone: '',
      notificationChannel: 'IN_APP',
      desiredWeeklyHours: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      homeTimezone: user.homeTimezone,
      notificationChannel: user.notificationChannel,
      desiredWeeklyHours: user.desiredWeeklyHours ? String(user.desiredWeeklyHours) : '',
      password: '',
    })
  }, [user, form])

  function onSubmit(values: UpdateUserFormValues) {
    updateUser.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        homeTimezone: values.homeTimezone,
        notificationChannel: values.notificationChannel,
        desiredWeeklyHours: values.desiredWeeklyHours ? Number(values.desiredWeeklyHours) : undefined,
        password: values.password || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {user ? `${user.firstName} ${user.lastName}` : 'user'}</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="homeTimezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home timezone</FormLabel>
                    <FormControl>
                      <Input placeholder="America/Los_Angeles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notificationChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notifications</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN_APP">In-app only</SelectItem>
                        <SelectItem value="IN_APP_AND_EMAIL">In-app + email</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredWeeklyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired hours/wk</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset password (optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
