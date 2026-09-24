import { useLiveQuery } from 'dexie-react-hooks'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  HelpCircle,
  Receipt,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { formatCents } from '../../lib/money'
import { computeAccountBalance } from '../accounts/balance'
import { getIncludedAccountIds, setIncludedAccountIds } from './balanceFilter'

const RECENT_LIMIT = 8

export default function HomePage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [includedIds, setIncludedIds] = useState<string[] | null>(() => getIncludedAccountIds())

  const accounts = useLiveQuery(
    () => db.accounts.filter((a) => !a.closed).sortBy('sortOrder'),
    [],
  )
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])
  const recurringTemplates = useLiveQuery(
    () => db.recurringTemplates.orderBy('sortOrder').toArray(),
    [],
  )

  function isIncluded(accountId: string): boolean {
    return includedIds === null || includedIds.includes(accountId)
  }

  function toggleAccount(accountId: string) {
    const current = includedIds ?? (accounts ?? []).map((a) => a.id)
    const next = current.includes(accountId)
      ? current.filter((id) => id !== accountId)
      : [...current, accountId]
    setIncludedIds(next)
    setIncludedAccountIds(next)
  }

  // Memoized so this array's identity only changes when `transactions` itself changes —
  // otherwise useCategoryLabels' internal useLiveQuery would see a "new" input every render
  // and re-run forever, pegging the CPU and making the whole page feel frozen.
  const recent = useMemo(
    () =>
      transactions
        ?.slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, RECENT_LIMIT),
    [transactions],
  )

  const accountNameById = new Map((accounts ?? []).map((a) => [a.id, a.name]))

  const totalBalance = (accounts ?? [])
    .filter((account) => isIncluded(account.id))
    .reduce((sum, account) => sum + computeAccountBalance(account, transactions ?? []), 0)

  return (
    <div className="page">
      <header className="page-header page-header--large">
        <h1>Home</h1>
        <Link to="/help" className="page-header__help" aria-label="How this app works">
          <HelpCircle size={22} />
        </Link>
      </header>
      <div className="page-body">
        <div className="home-balance">
          <button
            type="button"
            className="home-balance__filter-toggle"
            onClick={() => setFilterOpen((open) => !open)}
          >
            <span className="list-item__subtitle">Total balance</span>
            {accounts && accounts.length > 1 && <SlidersHorizontal size={14} />}
          </button>
          <h2 className={totalBalance < 0 ? 'amount-negative' : undefined}>
            {formatCents(totalBalance)}
          </h2>

          {filterOpen && accounts && accounts.length > 1 && (
            <div className="balance-filter">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  className="balance-filter__row"
                  onClick={() => toggleAccount(account.id)}
                >
                  <span
                    className={
                      isIncluded(account.id) ? 'balance-filter__check checked' : 'balance-filter__check'
                    }
                  >
                    {isIncluded(account.id) && <Check size={14} color="#fff" strokeWidth={3} />}
                  </span>
                  {account.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="home-add-buttons">
          <Link to="/transactions/new?kind=expense" className="home-add-button home-add-button--expense">
            <ArrowUpRight size={28} />
            <span>Add Expense</span>
          </Link>
          <Link to="/transactions/new?kind=income" className="home-add-button home-add-button--income">
            <ArrowDownLeft size={28} />
            <span>Add Income</span>
          </Link>
        </div>

        {accounts?.length === 0 && (
          <div className="empty-state">
            <Wallet size={40} strokeWidth={1.5} />
            <h2>Let's get set up</h2>
            <p>Add your first account, then use the buttons above to log money in or out.</p>
            <Link to="/accounts/new" className="btn btn-primary">
              Add an account
            </Link>
          </div>
        )}

        {recurringTemplates && recurringTemplates.length > 0 && (
          <div className="section-block">
            <h3>Recurring</h3>
            <div className="recurring-chips">
              {recurringTemplates.map((t) => (
                <Link
                  key={t.id}
                  to={`/recurring/${t.id}/edit`}
                  className={
                    t.kind === 'income'
                      ? 'recurring-chip recurring-chip--income'
                      : 'recurring-chip recurring-chip--expense'
                  }
                >
                  {t.kind === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {recent && recent.length > 0 && (
          <div className="section-block">
            <h3>Recent activity</h3>
            <ul className="list">
              {recent.map((t) => {
                const isIncome = t.amountCents > 0
                return (
                  <li key={t.id}>
                    <Link
                      className="list-item"
                      to={`/accounts/${t.accountId}/transactions/${t.id}/edit`}
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
                          {accountNameById.get(t.accountId) ?? 'Account'} ·{' '}
                          {isIncome ? 'Income' : 'Expense'}
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
          </div>
        )}

        {accounts && accounts.length > 0 && recent?.length === 0 && (
          <div className="empty-state">
            <Receipt size={40} strokeWidth={1.5} />
            <h2>No activity yet</h2>
            <p>Use the buttons above to add your first expense or income.</p>
          </div>
        )}
      </div>
    </div>
  )
}
