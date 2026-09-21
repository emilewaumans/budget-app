import type { Category, Split, Transaction } from '../../db/types'

export interface CategorySpend {
  categoryId: string
  name: string
  spentCents: number
}

/** Spending is only known per-category where a split exists — uncategorized expenses don't appear here. */
export function computeSpendingByCategory(
  month: string,
  categories: Category[],
  splits: Split[],
  transactionsById: Map<string, Transaction>,
): CategorySpend[] {
  const totals = new Map<string, number>()
  for (const split of splits) {
    const transaction = transactionsById.get(split.transactionId)
    if (!transaction || transaction.date.slice(0, 7) !== month) continue
    totals.set(split.categoryId, (totals.get(split.categoryId) ?? 0) - split.amountCents)
  }

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
  return Array.from(totals.entries())
    .map(([categoryId, spentCents]) => ({
      categoryId,
      name: categoryNameById.get(categoryId) ?? 'Unknown category',
      spentCents,
    }))
    .filter((row) => row.spentCents > 0)
    .sort((a, b) => b.spentCents - a.spentCents)
}

export interface MonthSpend {
  month: string
  spentCents: number
}

/** Total spending per month across ALL transactions (categorized or not), unlike the by-category breakdown. */
export function computeMonthlySpending(transactions: Transaction[], months: string[]): MonthSpend[] {
  return months.map((month) => {
    const spentCents =
      -transactions
        .filter((t) => t.amountCents < 0 && t.date.slice(0, 7) === month)
        .reduce((sum, t) => sum + t.amountCents, 0) || 0 // avoid a "-0,00" display when nothing was spent
    return { month, spentCents }
  })
}
