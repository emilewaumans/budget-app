import type { SavingsGoal, SavingsGoalMonth } from '../../db/types'

export interface GoalSummary {
  /** Money put toward this goal for the viewed month only. */
  assignedCents: number
  /** Total saved so far, carried forward from every prior month plus this one. */
  savedCents: number
}

/** Mirrors computeCategorySummaries, but goals never have a "spent" side — nothing is ever withdrawn in-app. */
export function computeGoalSummaries(
  goals: SavingsGoal[],
  month: string,
  goalMonths: SavingsGoalMonth[],
): Map<string, GoalSummary> {
  const assignedThisMonth = new Map<string, number>()
  const cumulativeAssigned = new Map<string, number>()

  for (const gm of goalMonths) {
    if (gm.month === month) {
      assignedThisMonth.set(gm.goalId, (assignedThisMonth.get(gm.goalId) ?? 0) + gm.assignedCents)
    }
    if (gm.month <= month) {
      cumulativeAssigned.set(gm.goalId, (cumulativeAssigned.get(gm.goalId) ?? 0) + gm.assignedCents)
    }
  }

  const summaries = new Map<string, GoalSummary>()
  for (const goal of goals) {
    summaries.set(goal.id, {
      assignedCents: assignedThisMonth.get(goal.id) ?? 0,
      savedCents: cumulativeAssigned.get(goal.id) ?? 0,
    })
  }
  return summaries
}
