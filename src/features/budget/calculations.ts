import type { Category, CategoryMonth, SavingsGoalMonth, Split, Transaction } from '../../db/types'

export interface CategorySummary {
  /** Money assigned to this category for the viewed month only. */
  assignedCents: number
  /** Money spent from this category during the viewed month only. */
  spentCents: number
  /**
   * Money still available in this category, carried forward from every prior
   * month plus this one — this is what "rollover" means: it's never reset,
   * only ever increased (by assigning) or decreased (by spending).
   */
  availableCents: number
}

function monthOf(dateISO: string): string {
  return dateISO.slice(0, 7)
}

/**
 * Ready to Assign is every euro that has come in as income but hasn't yet
 * been given a job — assigned to a category OR put toward a savings goal,
 * across all months — not just income you've already spent from. It goes
 * negative if you've assigned more than you've actually received. Categories
 * and goals draw from this one shared pool, so both are counted here.
 */
export function computeReadyToAssign(
  transactions: Transaction[],
  categoryMonths: CategoryMonth[],
  goalMonths: SavingsGoalMonth[] = [],
): number {
  const totalIncome = transactions
    .filter((t) => t.amountCents > 0)
    .reduce((sum, t) => sum + t.amountCents, 0)
  const totalAssigned =
    categoryMonths.reduce((sum, cm) => sum + cm.assignedCents, 0) +
    goalMonths.reduce((sum, gm) => sum + gm.assignedCents, 0)
  return totalIncome - totalAssigned
}

/**
 * Computes assigned/spent/available for every category, for a single viewed
 * month, in one pass over categoryMonths and splits (rather than re-scanning
 * per category) — cheap enough to recompute on every render at personal
 * finance data volumes.
 */
export function computeCategorySummaries(
  categories: Category[],
  month: string,
  categoryMonths: CategoryMonth[],
  splits: Split[],
  transactionsById: Map<string, Transaction>,
): Map<string, CategorySummary> {
  const assignedThisMonth = new Map<string, number>()
  const cumulativeAssigned = new Map<string, number>()
  const spentThisMonth = new Map<string, number>()
  const cumulativeSpent = new Map<string, number>()

  for (const cm of categoryMonths) {
    if (cm.month === month) {
      assignedThisMonth.set(cm.categoryId, (assignedThisMonth.get(cm.categoryId) ?? 0) + cm.assignedCents)
    }
    if (cm.month <= month) {
      cumulativeAssigned.set(cm.categoryId, (cumulativeAssigned.get(cm.categoryId) ?? 0) + cm.assignedCents)
    }
  }

  for (const split of splits) {
    const transaction = transactionsById.get(split.transactionId)
    if (!transaction) continue
    const splitMonth = monthOf(transaction.date)
    const spent = -split.amountCents // splits on expenses are stored negative
    if (splitMonth === month) {
      spentThisMonth.set(split.categoryId, (spentThisMonth.get(split.categoryId) ?? 0) + spent)
    }
    if (splitMonth <= month) {
      cumulativeSpent.set(split.categoryId, (cumulativeSpent.get(split.categoryId) ?? 0) + spent)
    }
  }

  const summaries = new Map<string, CategorySummary>()
  for (const category of categories) {
    summaries.set(category.id, {
      assignedCents: assignedThisMonth.get(category.id) ?? 0,
      spentCents: spentThisMonth.get(category.id) ?? 0,
      availableCents:
        (cumulativeAssigned.get(category.id) ?? 0) - (cumulativeSpent.get(category.id) ?? 0),
    })
  }
  return summaries
}
