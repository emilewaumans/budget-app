import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { currentMonthKey, formatMonthKey, lastNMonthKeys, shiftMonthKey } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { computeMonthlySpending } from './calculations'

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonthKey())

  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  if (!transactions) return null

  const months = lastNMonthKeys(month, 6)
  const monthly = computeMonthlySpending(transactions, months)
  const maxMonthlySpend = Math.max(1, ...monthly.map((m) => m.spentCents))

  return (
    <div className="page">
      <PageHeader title="Reports" back helpTopic="reports" />
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
          <h3>Spending, month over month</h3>
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
