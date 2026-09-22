import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, PiggyBank, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { computeReadyToAssign } from '../budget/calculations'
import { currentMonthKey, formatDate, formatMonthKey, shiftMonthKey } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { AssignedInput } from '../budget/AssignedInput'
import { computeGoalSummaries } from './calculations'

export default function GoalsPage() {
  const [month, setMonth] = useState(currentMonthKey())

  const goals = useLiveQuery(() => db.savingsGoals.orderBy('sortOrder').toArray(), [])
  const goalMonths = useLiveQuery(() => db.savingsGoalMonths.toArray(), [])
  const categoryMonths = useLiveQuery(() => db.categoryMonths.toArray(), [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  if (!goals || !goalMonths || !categoryMonths || !transactions) return null

  const summaries = computeGoalSummaries(goals, month, goalMonths)
  const readyToAssign = computeReadyToAssign(transactions, categoryMonths, goalMonths)

  async function setAssigned(goalId: string, assignedCents: number) {
    const existing = await db.savingsGoalMonths.where({ goalId, month }).first()
    if (existing) {
      await db.savingsGoalMonths.update(existing.id, { assignedCents })
    } else {
      await db.savingsGoalMonths.add({ id: crypto.randomUUID(), goalId, month, assignedCents })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Savings Goals</h1>
      </header>
      <div className="page-body">
        <div className={readyToAssign < 0 ? 'ready-to-assign over' : 'ready-to-assign'}>
          <div className="ready-to-assign__icon">
            <PiggyBank size={22} />
          </div>
          <div className="list-item__subtitle">Ready to Assign</div>
          <h2>{formatCents(readyToAssign)}</h2>
          <p className="ready-to-assign__hint">
            Shared with your Budget — putting money toward a goal here uses up the same Ready to
            Assign.
          </p>
        </div>

        <div className="month-nav">
          <button type="button" onClick={() => setMonth(shiftMonthKey(month, -1))} aria-label="Previous month">
            <ChevronLeft size={20} />
          </button>
          <strong>{formatMonthKey(month)}</strong>
          <button type="button" onClick={() => setMonth(shiftMonthKey(month, 1))} aria-label="Next month">
            <ChevronRight size={20} />
          </button>
        </div>

        {goals.length === 0 && (
          <div className="empty-state">
            <PiggyBank size={40} strokeWidth={1.5} />
            <h2>No savings goals yet</h2>
            <p>
              Add something you're saving toward, like a new watch or a vacation, and set money
              aside for it a little at a time.
            </p>
            <Link to="/goals/new" className="btn btn-primary">
              Add a savings goal
            </Link>
          </div>
        )}

        {goals.length > 0 && (
          <div className="category-columns">
            <span />
            <span>This month</span>
            <span>Saved</span>
          </div>
        )}

        {goals.length > 0 && (
          <ul className="list">
            {goals.map((goal) => {
              const summary = summaries.get(goal.id) ?? { assignedCents: 0, savedCents: 0 }
              const progressPct = Math.min(100, Math.max(0, (summary.savedCents / goal.targetCents) * 100))
              const reached = summary.savedCents >= goal.targetCents
              return (
                <li key={goal.id} className="category-item">
                  <div className="category-row">
                    <Link to={`/goals/${goal.id}/edit`} className="list-item__title">
                      {goal.name}
                    </Link>
                    <AssignedInput
                      value={summary.assignedCents}
                      onCommit={(cents) => setAssigned(goal.id, cents)}
                    />
                    <span className="amount-positive">{formatCents(summary.savedCents)}</span>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-progress__bar">
                      <div className="goal-progress__fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="goal-progress__label">
                      {reached
                        ? `Reached! ${formatCents(goal.targetCents)} goal`
                        : `${formatCents(summary.savedCents)} of ${formatCents(goal.targetCents)} by ${formatDate(goal.targetDate)}`}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {goals.length > 0 && (
        <Link to="/goals/new" className="fab" aria-label="Add savings goal">
          <Plus size={26} />
        </Link>
      )}
    </div>
  )
}
