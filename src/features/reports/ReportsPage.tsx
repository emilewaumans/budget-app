import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, PieChart } from 'lucide-react'
import { useState } from 'react'
import { db } from '../../db/db'
import { currentMonthKey, formatMonthKey, lastNMonthKeys, shiftMonthKey } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { computeMonthlySpending, computeSpendingByCategory } from './calculations'

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonthKey())

  const categories = useLiveQuery(() => db.categories.toArray(), [])
  const splits = useLiveQuery(() => db.splits.toArray(), [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  if (!categories || !splits || !transactions) return null

  const transactionsById = new Map(transactions.map((t) => [t.id, t]))
  const byCategory = computeSpendingByCategory(month, categories, splits, transactionsById)
  const maxCategorySpend = Math.max(1, ...byCategory.map((r) => r.spentCents))

  const months = lastNMonthKeys(month, 6)
  const monthly = computeMonthlySpending(transactions, months)
  const maxMonthlySpend = Math.max(1, ...monthly.map((m) => m.spentCents))

  return (
    <div className="page">
      <header className="page-header">
        <h1>Reports</h1>
      </header>
      <div className="page-body">
        <div className="month-nav">
          <button type="button" onClick={() => setMonth(shiftMonthKey(month, -1))} aria-label="Previous month">
            <ChevronLeft size={20} />
          </button>
          <strong>{formatMonthKey(month)}</strong>
          <button type="button" onClick={() => setMonth(shiftMonthKey(month, 1))} aria-label="Next month">
            <ChevronRight size={20} />
          </button>
        </div>

        <section>
          <h3>Spending by category</h3>
          {byCategory.length === 0 ? (
            <div className="empty-state">
              <PieChart size={36} strokeWidth={1.5} />
              <p>No categorized spending this month</p>
            </div>
          ) : (
            <div className="bar-list">
              {byCategory.map((row) => (
                <div key={row.categoryId} className="bar-row">
                  <div className="bar-row__label">
                    <span>{row.name}</span>
                    <span>{formatCents(row.spentCents)}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(row.spentCents / maxCategorySpend) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3>Month over month</h3>
          <div className="bar-list">
            {monthly.map((row) => (
              <div key={row.month} className="bar-row">
                <div className="bar-row__label">
                  <span>{formatMonthKey(row.month)}</span>
                  <span>{formatCents(row.spentCents)}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(row.spentCents / maxMonthlySpend) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
