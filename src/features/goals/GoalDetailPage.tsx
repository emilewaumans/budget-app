import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Receipt } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { formatDate } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { computeSavedCents } from './calculations'

export default function GoalDetailPage() {
  const { goalId } = useParams()

  const goal = useLiveQuery(() => (goalId ? db.savingsGoals.get(goalId) : undefined), [goalId])
  const contributions = useLiveQuery(async () => {
    if (!goalId) return []
    const rows = await db.savingsGoalContributions.where('goalId').equals(goalId).toArray()
    return rows.sort((a, b) => b.date.localeCompare(a.date))
  }, [goalId])

  if (!goalId || goal === undefined) return null

  if (goal === null) {
    return (
      <div className="page">
        <PageHeader title="Goal not found" back />
      </div>
    )
  }

  const savedCents = computeSavedCents(goalId, contributions ?? [])
  const progressPct = Math.min(100, Math.max(0, (savedCents / goal.targetCents) * 100))
  const reached = savedCents >= goal.targetCents

  return (
    <div className="page">
      <PageHeader title={goal.name} back helpTopic="goals" />
      <div className="page-body">
        <div>
          <div className="list-item__subtitle">Saved</div>
          <h2 className={savedCents < 0 ? 'amount-negative' : undefined}>{formatCents(savedCents)}</h2>
          <div className="goal-progress">
            <div className="goal-progress__bar">
              <div className="goal-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="goal-progress__label">
              {reached
                ? `Reached! Target was ${formatCents(goal.targetCents)}`
                : `${formatCents(goal.targetCents)} by ${formatDate(goal.targetDate)}`}
            </div>
          </div>
        </div>

        <Link to={`/goals/${goalId}/edit`} className="btn">
          <Pencil size={16} /> Edit goal
        </Link>

        {contributions && contributions.length > 0 && (
          <ul className="list">
            {contributions.map((c) => {
              const isDeposit = c.amountCents >= 0
              return (
                <li key={c.id}>
                  <Link
                    className="list-item"
                    to={`/goals/${goalId}/contributions/${c.id}/edit`}
                  >
                    <span
                      className={
                        isDeposit
                          ? 'list-item__icon list-item__icon--positive'
                          : 'list-item__icon list-item__icon--negative'
                      }
                    >
                      {isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>
                    <span className="list-item__text">
                      <div className="list-item__title">{isDeposit ? 'Deposit' : 'Withdrawal'}</div>
                      <div className="list-item__subtitle">
                        {c.date}
                        {c.note ? ` · ${c.note}` : ''}
                      </div>
                    </span>
                    <span className={isDeposit ? 'amount-positive' : 'amount-negative'}>
                      {formatCents(c.amountCents)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {contributions?.length === 0 && (
          <div className="empty-state">
            <Receipt size={40} strokeWidth={1.5} />
            <h2>No savings logged yet</h2>
            <p>Tap the + button to log the first time you set money aside for this.</p>
          </div>
        )}
      </div>
      <Link to={`/goals/${goalId}/contributions/new`} className="fab" aria-label="Log savings">
        <Plus size={26} />
      </Link>
    </div>
  )
}
