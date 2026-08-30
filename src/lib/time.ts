import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

/** Adds `days` (may be negative) to a "YYYY-MM-DD" date string. */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

/** The Sunday (YYYY-MM-DD) that starts the week containing — or is — `date`. */
export function upcomingSunday(date: Date = new Date()): string {
  const iso = date.toISOString().slice(0, 10)
  const dow = new Date(`${iso}T00:00:00.000Z`).getUTCDay()
  return addDaysToDateStr(iso, dow === 0 ? 0 : 7 - dow)
}

/** Local calendar date (YYYY-MM-DD) a UTC instant falls on in `timeZone`. */
export function localDateOf(instant: string | Date, timeZone: string): string {
  return formatInTimeZone(instant, timeZone, 'yyyy-MM-dd')
}

/** 0 (Sunday) .. 6 (Saturday) for a local calendar date, in `timeZone`. */
export function localDayOfWeek(instant: string | Date, timeZone: string): number {
  const [y, m, d] = localDateOf(instant, timeZone).split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** e.g. "9:00 AM" in the given timezone. */
export function formatLocalTime(instant: string | Date, timeZone: string): string {
  return formatInTimeZone(instant, timeZone, 'h:mm a')
}

/** e.g. "Fri, Sep 4" in the given timezone. */
export function formatLocalDate(instant: string | Date, timeZone: string): string {
  return formatInTimeZone(instant, timeZone, 'EEE, MMM d')
}

/** e.g. "9:00 AM – 5:00 PM" in the given timezone (handles overnight shifts fine — just two instants). */
export function formatLocalTimeRange(start: string | Date, end: string | Date, timeZone: string): string {
  return `${formatLocalTime(start, timeZone)} – ${formatLocalTime(end, timeZone)}`
}

export function shiftDurationHours(startAt: string, endAt: string): number {
  return (new Date(endAt).getTime() - new Date(startAt).getTime()) / 3_600_000
}

/** Converts a local "HH:mm" wall-clock time on a given date/timezone into a UTC ISO instant. */
export function localTimeToUtcIso(dateStr: string, time: string, timeZone: string): string {
  return fromZonedTime(`${dateStr}T${time}:00`, timeZone).toISOString()
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
