import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { PayeeInput } from '../../components/PayeeInput'
import { db } from '../../db/db'
import type { TransactionKind } from '../../db/types'
import { todayISO } from '../../lib/dates'
import { centsToInputString, parseToCents } from '../../lib/money'

export default function TransactionFormPage() {
  const { accountId: accountIdFromRoute, transactionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(transactionId)
  const accountIsFixed = Boolean(accountIdFromRoute)

  const [kind, setKind] = useState<TransactionKind>(
    searchParams.get('kind') === 'income' ? 'income' : 'expense',
  )
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')
  const [date, setDate] = useState(todayISO())
  const [memo, setMemo] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')

  const openAccounts = useLiveQuery(
    () => db.accounts.filter((a) => !a.closed).sortBy('sortOrder'),
    [],
  )

  useEffect(() => {
    if (accountIsFixed || isEditing || selectedAccountId || !openAccounts) return
    if (openAccounts.length > 0) setSelectedAccountId(openAccounts[0].id)
  }, [accountIsFixed, isEditing, selectedAccountId, openAccounts])

  useEffect(() => {
    if (isEditing) return
    const paramKind = searchParams.get('kind')
    if (paramKind === 'income' || paramKind === 'expense') setKind(paramKind)
  }, [isEditing, searchParams])

  useEffect(() => {
    if (!isEditing) return
    db.transactions.get(transactionId!).then((transaction) => {
      if (!transaction) return
      setSelectedAccountId(transaction.accountId)
      setKind(transaction.amountCents < 0 ? 'expense' : 'income')
      setAmount(centsToInputString(Math.abs(transaction.amountCents)))
      setPayee(transaction.payee)
      setDate(transaction.date)
      setMemo(transaction.memo)
    })
  }, [isEditing, transactionId])

  const accountId = accountIdFromRoute ?? selectedAccountId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accountId) return

    const magnitude = Math.abs(parseToCents(amount))
    const amountCents = kind === 'expense' ? -magnitude : magnitude

    if (isEditing && transactionId) {
      await db.transactions.update(transactionId, {
        date,
        payee: payee.trim(),
        memo: memo.trim(),
        amountCents,
      })
    } else {
      await db.transactions.add({
        id: crypto.randomUUID(),
        accountId,
        date,
        payee: payee.trim(),
        memo: memo.trim(),
        cleared: false,
        amountCents,
      })
    }

    navigate(-1)
  }

  async function handleDelete() {
    if (!transactionId) return
    await db.transactions.delete(transactionId)
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit transaction' : 'Add transaction'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="segmented">
          <button
            type="button"
            className={kind === 'expense' ? 'active expense' : undefined}
            onClick={() => setKind('expense')}
          >
            <ArrowUpRight size={16} /> Expense
          </button>
          <button
            type="button"
            className={kind === 'income' ? 'active income' : undefined}
            onClick={() => setKind('income')}
          >
            <ArrowDownLeft size={16} /> Income
          </button>
        </div>

        {!accountIsFixed && (
          <div className="field">
            <label htmlFor="account">Account</label>
            <select
              id="account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              required
            >
              <option value="" disabled>
                Choose an account
              </option>
              {openAccounts?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <MoneyInput id="amount" label="Amount" value={amount} onChange={setAmount} />

        <PayeeInput id="payee" label="Payee" value={payee} onChange={setPayee} required />

        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="memo">Memo (optional)</label>
          <input id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && (
          <button type="button" className="btn btn-danger btn-block" onClick={handleDelete}>
            <Trash2 size={18} /> Delete transaction
          </button>
        )}
      </form>
    </div>
  )
}
