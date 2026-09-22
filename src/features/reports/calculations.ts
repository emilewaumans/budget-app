import type { Transaction } from '../../db/types'

export interface MonthSpend {
  month: string
  spentCents: number
}

/** Total spending per month across all transactions. */
export function computeMonthlySpending(transactions: Transaction[], months: string[]): MonthSpend[] {
  return months.map((month) => {
    const spentCents =
      -transactions
        .filter((t) => t.amountCents < 0 && t.date.slice(0, 7) === month)
        .reduce((sum, t) => sum + t.amountCents, 0) || 0 // avoid a "-0,00" display when nothing was spent
    return { month, spentCents }
  })
}
