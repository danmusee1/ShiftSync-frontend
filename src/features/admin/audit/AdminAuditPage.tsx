import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useExportAuditLog } from '@/hooks/use-audit'
import { useLocations } from '@/hooks/use-locations'
import { addDaysToDateStr, upcomingSunday } from '@/lib/time'

export function AdminAuditPage() {
  const { data: locations } = useLocations()
  const [locationId, setLocationId] = useState('ALL')
  const [from, setFrom] = useState(addDaysToDateStr(upcomingSunday(), -28))
  const [to, setTo] = useState(addDaysToDateStr(upcomingSunday(), 7))
  const exportLog = useExportAuditLog()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Every mutation to a scheduling-relevant record, exportable as a spreadsheet.
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All locations</SelectItem>
              {locations?.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          disabled={exportLog.isPending}
          onClick={() =>
            exportLog.mutate({
              from: `${from}T00:00:00.000Z`,
              to: `${to}T23:59:59.999Z`,
              locationId: locationId === 'ALL' ? undefined : locationId,
            })
          }
        >
          {exportLog.isPending ? <Loader2 className="animate-spin" /> : <Download />}
          Download spreadsheet
        </Button>
      </div>
    </div>
  )
}
