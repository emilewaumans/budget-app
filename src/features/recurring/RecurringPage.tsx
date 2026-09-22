import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Plus, Repeat } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
import { createTransactionFromTemplate } from './useFromTemplate'

export default function RecurringPage() {
  const navigate = useNavigate()
  const templates = useLiveQuery(() => db.recurringTemplates.orderBy('sortOrder').toArray(), [])
  const accounts = useLiveQuery(() => db.accounts.toArray(), [])
  const accountNameById = new Map((accounts ?? []).map((a) => [a.id, a.name]))
  const [using, setUsing] = useState<string | null>(null)

  async function handleUse(templateId: string) {
    const template = await db.recurringTemplates.get(templateId)
    if (!template) return
    setUsing(templateId)
    try {
      const transactionId = await createTransactionFromTemplate(template)
      navigate(`/accounts/${template.accountId}/transactions/${transactionId}/edit`)
    } finally {
      setUsing(null)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Recurring" back />
      <div className="page-body">
        <p className="list-item__subtitle">
          Save a payee and amount you use often, like your salary or a subscription, then add it
          in one tap without retyping it.
        </p>

        {templates && templates.length > 0 && (
          <ul className="list">
            {templates.map((t) => {
              const isIncome = t.kind === 'income'
              return (
                <li key={t.id} className="recurring-row">
                  <Link className="list-item recurring-row__info" to={`/recurring/${t.id}/edit`}>
                    <span
                      className={
                        isIncome
                          ? 'list-item__icon list-item__icon--positive'
                          : 'list-item__icon list-item__icon--negative'
                      }
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>
                    <span className="list-item__text">
                      <div className="list-item__title">{t.name}</div>
                      <div className="list-item__subtitle">
                        {accountNameById.get(t.accountId) ?? 'Account'} · {t.payee}
                      </div>
                    </span>
                    <span className={isIncome ? 'amount-positive' : 'amount-negative'}>
                      {formatCents(isIncome ? t.amountCents : -t.amountCents)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="recurring-row__use"
                    onClick={() => handleUse(t.id)}
                    disabled={using === t.id}
                    aria-label={`Add ${t.name} now`}
                  >
                    <Repeat size={18} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {templates?.length === 0 && (
          <div className="empty-state">
            <Repeat size={40} strokeWidth={1.5} />
            <h2>No recurring items yet</h2>
            <p>
              Add one for anything you log often, like your salary or Netflix, so you never have
              to retype it.
            </p>
          </div>
        )}
      </div>
      <Link to="/recurring/new" className="fab" aria-label="Add recurring">
        <Plus size={26} />
      </Link>
    </div>
  )
}
