import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Receipt } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
import { useCategoryLabels } from '../transactions/useCategoryLabels'
import { ACCOUNT_COLORS } from './accountColors'
import { ACCOUNT_TYPE_ICONS } from './accountTypes'
import { computeAccountBalance } from './balance'

export default function AccountDetailPage() {
  const { accountId } = useParams()

  const account = useLiveQuery(() => (accountId ? db.accounts.get(accountId) : undefined), [
    accountId,
  ])
  const transactions = useLiveQuery(async () => {
    if (!accountId) return []
    const rows = await db.transactions.where('accountId').equals(accountId).toArray()
    return rows.sort((a, b) => b.date.localeCompare(a.date))
  }, [accountId])

  const categoryLabelByTransactionId = useCategoryLabels(transactions)

  if (!accountId || account === undefined) return null

  if (account === null) {
    return (
      <div className="page">
        <PageHeader title="Account not found" back />
      </div>
    )
  }

  const balance = computeAccountBalance(account, transactions ?? [])
  const color = account.color ?? ACCOUNT_COLORS[0]
  const AccountIcon = ACCOUNT_TYPE_ICONS[account.type]

  return (
    <div className="page">
      <PageHeader title={account.name} back />
      <div className="page-body">
        <div className="account-summary">
          <span className="list-item__icon" style={{ background: `${color}22`, color }}>
            <AccountIcon size={22} />
          </span>
          <div>
            <div className="list-item__subtitle">Balance</div>
            <h2 className={balance < 0 ? 'amount-negative' : undefined}>{formatCents(balance)}</h2>
          </div>
        </div>

        <Link to={`/accounts/${accountId}/edit`} className="btn">
          <Pencil size={16} /> Edit account
        </Link>

        {transactions && transactions.length > 0 && (
          <ul className="list">
            {transactions.map((t) => {
              const isIncome = t.amountCents > 0
              return (
                <li key={t.id}>
                  <Link
                    className="list-item"
                    to={`/accounts/${accountId}/transactions/${t.id}/edit`}
                  >
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
                      <div className="list-item__title">{t.payee}</div>
                      <div className="list-item__subtitle">
                        {t.date} ·{' '}
                        {categoryLabelByTransactionId?.get(t.id) ??
                          (isIncome ? 'Income' : 'Uncategorized')}
                      </div>
                    </span>
                    <span className={isIncome ? 'amount-positive' : 'amount-negative'}>
                      {formatCents(t.amountCents)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {transactions?.length === 0 && (
          <div className="empty-state">
            <Receipt size={40} strokeWidth={1.5} />
            <h2>No transactions yet</h2>
            <p>Tap the + button to log your first expense or income for this account.</p>
          </div>
        )}
      </div>
      <Link to={`/accounts/${accountId}/transactions/new`} className="fab" aria-label="Add transaction">
        <Plus size={26} />
      </Link>
    </div>
  )
}
