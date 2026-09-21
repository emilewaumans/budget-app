import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
import { computeAccountBalance } from './balance'

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  cash: 'Cash',
  credit: 'Credit card',
}

export default function AccountsListPage() {
  const accounts = useLiveQuery(
    () => db.accounts.filter((a) => !a.closed).sortBy('sortOrder'),
    [],
  )
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  return (
    <div className="page">
      <PageHeader title="Accounts" />
      <div className="page-body">
        <ul className="list">
          {accounts?.map((account) => {
            const balance = computeAccountBalance(account, transactions ?? [])
            return (
              <li key={account.id}>
                <Link className="list-item" to={`/accounts/${account.id}`}>
                  <span>
                    <div className="list-item__title">{account.name}</div>
                    <div className="list-item__subtitle">
                      {ACCOUNT_TYPE_LABELS[account.type]}
                    </div>
                  </span>
                  <span className={balance < 0 ? 'amount-negative' : undefined}>
                    {formatCents(balance)}
                  </span>
                </Link>
              </li>
            )
          })}
          {accounts?.length === 0 && <li className="list-empty">No accounts yet</li>}
        </ul>
      </div>
      <Link to="/accounts/new" className="fab fab--above-nav" aria-label="Add account">
        +
      </Link>
    </div>
  )
}
