import dayjs from 'dayjs'

/** Returns today's date as 'YYYY-MM-DD'. */
export function todayISO(): string {
  return dayjs().format('YYYY-MM-DD')
}

/** Returns the current month as 'YYYY-MM'. */
export function currentMonthKey(): string {
  return dayjs().format('YYYY-MM')
}

/** Shifts a 'YYYY-MM' month key by a number of months (negative to go back). */
export function shiftMonthKey(month: string, delta: number): string {
  return dayjs(`${month}-01`).add(delta, 'month').format('YYYY-MM')
}

/** Formats a 'YYYY-MM' month key for display, e.g. "September 2026". */
export function formatMonthKey(month: string): string {
  return dayjs(`${month}-01`).format('MMMM YYYY')
}

/** Formats a 'YYYY-MM-DD' date for display, e.g. "31 Dec 2026". */
export function formatDate(dateISO: string): string {
  return dayjs(dateISO).format('D MMM YYYY')
}

/** Returns the n most recent month keys up to and including `month`, oldest first. */
export function lastNMonthKeys(month: string, n: number): string[] {
  const result: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    result.push(shiftMonthKey(month, -i))
  }
  return result
}
