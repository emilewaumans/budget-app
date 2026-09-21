import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { todayISO } from '../../lib/dates'
import { centsToInputString, parseToCents } from '../../lib/money'

type TransactionKind = 'expense' | 'income'

export default function TransactionFormPage() {
  const { accountId, transactionId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(transactionId)

  const [kind, setKind] = useState<TransactionKind>('expense')
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')
  const [date, setDate] = useState(todayISO())
  const [memo, setMemo] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const payeeSuggestions = useLiveQuery(async () => {
    const all = await db.transactions.orderBy('date').reverse().toArray()
    return Array.from(new Set(all.map((t) => t.payee).filter(Boolean)))
  }, [])

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])

  useEffect(() => {
    if (!transactionId) return
    db.transactions.get(transactionId).then((transaction) => {
      if (!transaction) return
      setKind(transaction.amountCents < 0 ? 'expense' : 'income')
      setAmount(centsToInputString(Math.abs(transaction.amountCents)))
      setPayee(transaction.payee)
      setDate(transaction.date)
      setMemo(transaction.memo)
    })
    db.splits.where('transactionId').equals(transactionId).first().then((split) => {
      if (split) setCategoryId(split.categoryId)
    })
  }, [transactionId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accountId) return

    const magnitude = Math.abs(parseToCents(amount))
    const amountCents = kind === 'expense' ? -magnitude : magnitude

    let id = transactionId
    if (isEditing && transactionId) {
      await db.transactions.update(transactionId, {
        date,
        payee: payee.trim(),
        memo: memo.trim(),
        amountCents,
      })
    } else {
      id = crypto.randomUUID()
      await db.transactions.add({
        id,
        accountId,
        date,
        payee: payee.trim(),
        memo: memo.trim(),
        cleared: false,
        amountCents,
      })
    }

    // Every transaction has at most one split for now (multi-category splits arrive later) —
    // an expense with a category gets exactly one split row; anything else gets none.
    if (id) {
      const existingSplit = await db.splits.where('transactionId').equals(id).first()
      if (kind === 'expense' && categoryId) {
        if (existingSplit) {
          await db.splits.update(existingSplit.id, { categoryId, amountCents })
        } else {
          await db.splits.add({
            id: crypto.randomUUID(),
            transactionId: id,
            categoryId,
            amountCents,
            memo: '',
          })
        }
      } else if (existingSplit) {
        await db.splits.delete(existingSplit.id)
      }
    }

    navigate(-1)
  }

  async function handleDelete() {
    if (!transactionId) return
    await db.splits.where('transactionId').equals(transactionId).delete()
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
            className={kind === 'expense' ? 'active' : undefined}
            onClick={() => setKind('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={kind === 'income' ? 'active' : undefined}
            onClick={() => setKind('income')}
          >
            Income
          </button>
        </div>

        <MoneyInput id="amount" label="Amount" value={amount} onChange={setAmount} />

        <div className="field">
          <label htmlFor="payee">Payee</label>
          <input
            id="payee"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            list="payee-suggestions"
            placeholder="e.g. Colruyt"
            required
          />
          <datalist id="payee-suggestions">
            {payeeSuggestions?.map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        {kind === 'expense' && (
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Uncategorized —</option>
              {groups?.map((group) => (
                <optgroup key={group.id} label={group.name}>
                  {categories
                    ?.filter((c) => c.groupId === group.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="memo">Memo (optional)</label>
          <input id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && (
          <button type="button" className="btn btn-danger btn-block" onClick={handleDelete}>
            Delete transaction
          </button>
        )}
      </form>
    </div>
  )
}
