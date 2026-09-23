import { useLiveQuery } from 'dexie-react-hooks'
import { HelpCircle, PiggyBank, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
import { computeSavedByGoal } from './calculations'

export default function GoalsPage() {
  const goals = useLiveQuery(() => db.savingsGoals.orderBy('sortOrder').toArray(), [])
  const contributions = useLiveQuery(() => db.savingsGoalContributions.toArray(), [])

  if (!goals || !contributions) return null

  const savedByGoal = computeSavedByGoal(contributions)

  return (
    <div className="page">
      <header className="page-header page-header--large">
        <h1>Savings Goals</h1>
        <Link to="/help?topic=goals" className="page-header__help" aria-label="How this page works">
          <HelpCircle size={22} />
        </Link>
      </header>
      <div className="page-body">
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
          <ul className="list">
            {goals.map((goal) => {
              const savedCents = savedByGoal.get(goal.id) ?? 0
              const progressPct = Math.min(100, Math.max(0, (savedCents / goal.targetCents) * 100))
              const reached = savedCents >= goal.targetCents
              return (
                <li key={goal.id} className="assign-item">
                  <Link to={`/goals/${goal.id}`} className="list-item list-item--flush">
                    <span className="list-item__title">{goal.name}</span>
                    <span className={savedCents < 0 ? 'amount-negative' : 'amount-positive'}>
                      {formatCents(savedCents)}
                    </span>
                  </Link>
                  <div className="goal-progress">
                    <div className="goal-progress__bar">
                      <div className="goal-progress__fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="goal-progress__label">
                      {reached
                        ? `Reached! ${formatCents(goal.targetCents)} goal`
                        : `${formatCents(savedCents)} of ${formatCents(goal.targetCents)}`}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {goals.length > 0 && (
        <Link to="/goals/new" className="fab fab--above-nav" aria-label="Add savings goal">
          <Plus size={26} />
        </Link>
      )}
    </div>
  )
}
