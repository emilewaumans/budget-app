import { useLiveQuery } from 'dexie-react-hooks'
import { Landmark, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
import { ACCOUNT_COLORS } from './accountColors'
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS } from './accountTypes'
import { computeAccountBalance } from './balance'

export default function AccountsListPage() {
  const accounts = useLiveQuery(
    () => db.accounts.filter((a) => !a.closed).sortBy('sortOrder'),
    [],
  )
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  return (
    <div className="page">
      <PageHeader title="Accounts" back helpTopic="accounts" />
      <div className="page-body">
        {accounts && accounts.length > 0 && (
          <ul className="list">
            {accounts.map((account) => {
              const balance = computeAccountBalance(account, transactions ?? [])
              const Icon = ACCOUNT_TYPE_ICONS[account.type]
              const color = account.color ?? ACCOUNT_COLORS[0]
              return (
                <li key={account.id}>
                  <Link className="list-item" to={`/accounts/${account.id}`}>
                    <span className="list-item__icon" style={{ background: `${color}22`, color }}>
                      <Icon size={20} />
                    </span>
                    <span className="list-item__text">
                      <div className="list-item__title">{account.name}</div>
                      <div className="list-item__subtitle">{ACCOUNT_TYPE_LABELS[account.type]}</div>
                    </span>
                    <span className={balance < 0 ? 'amount-negative' : undefined}>
                      {formatCents(balance)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {accounts?.length === 0 && (
          <div className="empty-state">
            <Landmark size={40} strokeWidth={1.5} />
            <h2>No accounts yet</h2>
            <p>
              Add a checking, savings, cash, or credit card account to start tracking where your
              money is.
            </p>
          </div>
        )}
      </div>
      <Link to="/accounts/new" className="fab" aria-label="Add account">
        <Plus size={26} />
      </Link>
    </div>
  )
}
