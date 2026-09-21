import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Receipt } from 'lucide-react'
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

  const categoryLabelByTransactionId = useLiveQuery(async () => {
    if (!transactions || transactions.length === 0) return new Map<string, string>()
    const transactionIds = transactions.map((t) => t.id)
    const [splits, categories] = await Promise.all([
      db.splits.where('transactionId').anyOf(transactionIds).toArray(),
      db.categories.toArray(),
    ])
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
    const splitsByTransactionId = new Map<string, typeof splits>()
    for (const split of splits) {
      const list = splitsByTransactionId.get(split.transactionId) ?? []
      list.push(split)
      splitsByTransactionId.set(split.transactionId, list)
    }
    const result = new Map<string, string>()
    for (const [transactionId, txSplits] of splitsByTransactionId) {
      if (txSplits.length > 1) {
        result.set(transactionId, 'Split')
      } else {
        const name = categoryNameById.get(txSplits[0].categoryId)
        if (name) result.set(transactionId, name)
      }
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
