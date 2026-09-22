import type { SavingsGoalContribution } from '../../db/types'

/** Total saved so far for one goal — just the running sum of its contribution log. */
export function computeSavedCents(goalId: string, contributions: SavingsGoalContribution[]): number {
  return contributions
    .filter((c) => c.goalId === goalId)
    .reduce((sum, c) => sum + c.amountCents, 0)
}

/** Same total, for every goal at once — one pass instead of filtering per goal. */
export function computeSavedByGoal(contributions: SavingsGoalContribution[]): Map<string, number> {
  const saved = new Map<string, number>()
  for (const c of contributions) {
    saved.set(c.goalId, (saved.get(c.goalId) ?? 0) + c.amountCents)
  }
  return saved
}
