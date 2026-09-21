import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { currentMonthKey, formatMonthKey, shiftMonthKey } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { computeCategorySummaries, computeReadyToAssign } from './calculations'
import { AssignedInput } from './AssignedInput'

export default function BudgetPage() {
  const [month, setMonth] = useState(currentMonthKey())

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])
  const categoryMonths = useLiveQuery(() => db.categoryMonths.toArray(), [])
  const splits = useLiveQuery(() => db.splits.toArray(), [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  if (!groups || !categories || !categoryMonths || !splits || !transactions) return null

  const transactionsById = new Map(transactions.map((t) => [t.id, t]))
  const summaries = computeCategorySummaries(categories, month, categoryMonths, splits, transactionsById)
  const readyToAssign = computeReadyToAssign(transactions, categoryMonths)

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
          <div className="list-item__subtitle">Ready to Assign</div>
          <h2>{formatCents(readyToAssign)}</h2>
        </div>

        <div className="month-nav">
          <button type="button" onClick={() => setMonth(shiftMonthKey(month, -1))} aria-label="Previous month">
            ‹
          </button>
          <strong>{formatMonthKey(month)}</strong>
          <button type="button" onClick={() => setMonth(shiftMonthKey(month, 1))} aria-label="Next month">
            ›
          </button>
        </div>

        {groups.length === 0 && (
          <p className="list-empty">
            No categories yet — <Link to="/categories">add some</Link> to start budgeting.
          </p>
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
                    <li key={category.id} className="list-item category-row">
                      <span className="list-item__title">{category.name}</span>
                      <AssignedInput
                        value={summary.assignedCents}
                        onCommit={(cents) => setAssigned(category.id, cents)}
                      />
                      <span className={summary.availableCents < 0 ? 'amount-negative' : 'amount-positive'}>
                        {formatCents(summary.availableCents)}
                      </span>
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
