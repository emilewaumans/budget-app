import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
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

  const categoryNameByTransactionId = useLiveQuery(async () => {
    if (!transactions || transactions.length === 0) return new Map<string, string>()
    const transactionIds = transactions.map((t) => t.id)
    const [splits, categories] = await Promise.all([
      db.splits.where('transactionId').anyOf(transactionIds).toArray(),
      db.categories.toArray(),
    ])
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
    const result = new Map<string, string>()
    for (const split of splits) {
      const name = categoryNameById.get(split.categoryId)
      if (name) result.set(split.transactionId, name)
    }
    return result
  }, [transactions])

  if (!accountId || account === undefined) return null

  if (account === null) {
    return (
      <div className="page">
        <PageHeader title="Account not found" back />
      </div>
    )
  }

  const balance = computeAccountBalance(account, transactions ?? [])

  return (
    <div className="page">
      <PageHeader title={account.name} back />
      <div className="page-body">
        <div>
          <div className="list-item__subtitle">Balance</div>
          <h2 className={balance < 0 ? 'amount-negative' : undefined}>{formatCents(balance)}</h2>
        </div>

        <Link to={`/accounts/${accountId}/edit`} className="btn">
          Edit account
        </Link>

        <ul className="list">
          {transactions?.map((t) => (
            <li key={t.id}>
              <Link className="list-item" to={`/accounts/${accountId}/transactions/${t.id}/edit`}>
                <span>
                  <div className="list-item__title">{t.payee}</div>
                  <div className="list-item__subtitle">
                    {t.date} · {categoryNameByTransactionId?.get(t.id) ?? (t.amountCents > 0 ? 'Income' : 'Uncategorized')}
                  </div>
                </span>
                <span className={t.amountCents < 0 ? 'amount-negative' : 'amount-positive'}>
                  {formatCents(t.amountCents)}
                </span>
              </Link>
            </li>
          ))}
          {transactions?.length === 0 && <li className="list-empty">No transactions yet</li>}
        </ul>
      </div>
      <Link to={`/accounts/${accountId}/transactions/new`} className="fab" aria-label="Add transaction">
        +
      </Link>
    </div>
  )
}
