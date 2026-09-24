import type { CustomPeriodUnit, RecurringPeriodKind } from '../../db/types'

export const PERIOD_PRESET_LABELS: Record<Exclude<RecurringPeriodKind, 'custom'>, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  halfYear: 'Every 6 months',
  yearly: 'Yearly',
}

const UNIT_LABELS: Record<CustomPeriodUnit, [singular: string, plural: string]> = {
  days: ['day', 'days'],
  weeks: ['week', 'weeks'],
  months: ['month', 'months'],
}

/** Older templates predate the period field entirely — treat as 'monthly', the most common cadence. */
export function formatPeriod(
  periodKind: RecurringPeriodKind | undefined,
  customCount?: number,
  customUnit?: CustomPeriodUnit,
): string {
  const kind = periodKind ?? 'monthly'
  if (kind !== 'custom') return PERIOD_PRESET_LABELS[kind]

  const count = customCount ?? 1
  const [singular, plural] = UNIT_LABELS[customUnit ?? 'months']
  return count === 1 ? `Every ${singular}` : `Every ${count} ${plural}`
}
