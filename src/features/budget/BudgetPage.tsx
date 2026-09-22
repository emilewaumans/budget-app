import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Tags, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { currentMonthKey, formatMonthKey, shiftMonthKey } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { AssignedInput } from './AssignedInput'
import { computeCategorySummaries, computeReadyToAssign } from './calculations'

export default function BudgetPage() {
  const [month, setMonth] = useState(currentMonthKey())

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])
  const categoryMonths = useLiveQuery(() => db.categoryMonths.toArray(), [])
  const splits = useLiveQuery(() => db.splits.toArray(), [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])
  const goalMonths = useLiveQuery(() => db.savingsGoalMonths.toArray(), [])

  if (!groups || !categories || !categoryMonths || !splits || !transactions || !goalMonths) return null

  const transactionsById = new Map(transactions.map((t) => [t.id, t]))
  const summaries = computeCategorySummaries(categories, month, categoryMonths, splits, transactionsById)
  const readyToAssign = computeReadyToAssign(transactions, categoryMonths, goalMonths)
  const hasCategories = groups.some((g) => categories.some((c) => c.groupId === g.id))

  async function setAssigned(categoryId: string, assignedCents: number) {
    const existing = await db.categoryMonths.where({ categoryId, month }).first()
    if (existing) {
      await db.categoryMonths.update(existing.id, { assignedCents })
    } else {
      await db.categoryMonths.add({ id: crypto.randomUUID(), categoryId, month, assignedCents })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Budget</h1>
      </header>
      <div className="page-body">
        <div className={readyToAssign < 0 ? 'ready-to-assign over' : 'ready-to-assign'}>
          <div className="ready-to-assign__icon">
            <Wallet size={22} />
          </div>
          <div className="list-item__subtitle">Ready to Assign</div>
          <h2>{formatCents(readyToAssign)}</h2>
          <p className="ready-to-assign__hint">
            {readyToAssign < 0
              ? "You've assigned more than you've received — lower an amount below."
              : 'Income you have not yet given a job. Assign it to a category below.'}
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

        {!hasCategories && (
          <div className="empty-state">
            <Tags size={40} strokeWidth={1.5} />
            <h2>No categories yet</h2>
            <p>Create categories like "Groceries" or "Rent" to start assigning your money.</p>
            <Link to="/categories" className="btn btn-primary">
              Add categories
            </Link>
          </div>
        )}

        {hasCategories && (
          <div className="category-columns">
            <span />
            <span>Assigned</span>
            <span>Available</span>
          </div>
        )}

        {groups.map((group) => {
          const groupCategories = categories.filter((c) => c.groupId === group.id)
          if (groupCategories.length === 0) return null
          return (
            <div key={group.id} className="category-group">
              <h3>{group.name}</h3>
              <ul className="list">
                {groupCategories.map((category) => {
                  const summary = summaries.get(category.id) ?? {
                    assignedCents: 0,
                    spentCents: 0,
                    availableCents: 0,
                  }
                  return (
                    <li key={category.id} className="category-item">
                      <div className="category-row">
                        <span className="list-item__title">{category.name}</span>
                        <AssignedInput
                          value={summary.assignedCents}
                          onCommit={(cents) => setAssigned(category.id, cents)}
                        />
                        <span className={summary.availableCents < 0 ? 'amount-negative' : 'amount-positive'}>
                          {formatCents(summary.availableCents)}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
