import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Plus, SplitSquareHorizontal, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { todayISO } from '../../lib/dates'
import { centsToInputString, formatCents, parseToCents } from '../../lib/money'
import { findMatchingRule } from '../rules/matching'

type TransactionKind = 'expense' | 'income'

interface SplitRow {
  key: string
  categoryId: string
  amount: string
}

function newRow(categoryId = '', amount = '0,00'): SplitRow {
  return { key: crypto.randomUUID(), categoryId, amount }
}

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
  const [rows, setRows] = useState<SplitRow[]>([newRow()])
  const [selectedAccountId, setSelectedAccountId] = useState('')

  const isSplit = rows.length > 1

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
      if (transaction) setSelectedAccountId(transaction.accountId)
    })
  }, [isEditing, transactionId])

  const accountId = accountIdFromRoute ?? selectedAccountId

  const payeeSuggestions = useLiveQuery(async () => {
    const all = await db.transactions.orderBy('date').reverse().toArray()
    return Array.from(new Set(all.map((t) => t.payee).filter(Boolean)))
  }, [])

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])
  const rules = useLiveQuery(() => db.rules.toArray(), [])

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
    db.splits
      .where('transactionId')
      .equals(transactionId)
      .toArray()
      .then((existingSplits) => {
        if (existingSplits.length === 0) return
        setRows(
          existingSplits.map((s) =>
            newRow(s.categoryId, centsToInputString(Math.abs(s.amountCents))),
          ),
        )
      })
  }, [transactionId])

  function updateRow(key: string, changes: Partial<SplitRow>) {
    setRows((current) => current.map((r) => (r.key === key ? { ...r, ...changes } : r)))
  }

  function startSplitting() {
    setRows((current) => [{ ...current[0], amount }, newRow()])
  }

  function addSplitRow() {
    const allocated = rows.reduce((sum, r) => sum + parseToCents(r.amount), 0)
    const remaining = Math.max(0, parseToCents(amount) - allocated)
    setRows((current) => [...current, newRow('', centsToInputString(remaining))])
  }

  function removeSplitRow(key: string) {
    setRows((current) => (current.length > 1 ? current.filter((r) => r.key !== key) : current))
  }

  function applyRuleSuggestion(payeeValue: string) {
    if (kind !== 'expense' || rows.length !== 1 || rows[0].categoryId || !rules) return
    const match = findMatchingRule(rules, payeeValue)
    if (match) updateRow(rows[0].key, { categoryId: match.categoryId })
  }

  const totalCents = Math.abs(parseToCents(amount))
  const allocatedCents = rows.reduce((sum, r) => sum + parseToCents(r.amount), 0)
  const remainingCents = totalCents - allocatedCents
  const splitInvalid = isSplit && remainingCents !== 0
  const splitMissingCategory = isSplit && rows.some((r) => !r.categoryId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accountId) return
    if (kind === 'expense' && (splitInvalid || splitMissingCategory)) return

    const magnitude = totalCents
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
    if (!id) return

    await db.splits.where('transactionId').equals(id).delete()

    if (kind === 'expense') {
      if (isSplit) {
        for (const row of rows) {
          await db.splits.add({
            id: crypto.randomUUID(),
            transactionId: id,
            categoryId: row.categoryId,
            amountCents: -Math.abs(parseToCents(row.amount)),
            memo: '',
          })
        }
      } else if (rows[0].categoryId) {
        await db.splits.add({
          id: crypto.randomUUID(),
          transactionId: id,
          categoryId: rows[0].categoryId,
          amountCents: -magnitude,
          memo: '',
        })
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

        <div className="field">
          <label htmlFor="payee">Payee</label>
          <input
            id="payee"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            onBlur={(e) => applyRuleSuggestion(e.target.value)}
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

        {kind === 'expense' && !isSplit && (
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={rows[0].categoryId}
              onChange={(e) => updateRow(rows[0].key, { categoryId: e.target.value })}
            >
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
            <button type="button" className="btn" onClick={startSplitting}>
              <SplitSquareHorizontal size={16} /> Split into multiple categories
            </button>
          </div>
        )}

        {kind === 'expense' && isSplit && (
          <div className="field split-rows">
            <label>Split across categories</label>
            {rows.map((row) => (
              <div key={row.key} className="split-row">
                <select
                  value={row.categoryId}
                  onChange={(e) => updateRow(row.key, { categoryId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
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
                <input
                  type="text"
                  inputMode="decimal"
                  value={row.amount}
                  onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                />
                <button
                  type="button"
                  className="split-row__remove"
                  onClick={() => removeSplitRow(row.key)}
                  aria-label="Remove split"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button type="button" className="btn" onClick={addSplitRow}>
              <Plus size={16} /> Add another category
            </button>
            <p className={remainingCents !== 0 ? 'amount-negative' : 'list-item__subtitle'}>
              {remainingCents === 0
                ? 'Fully allocated'
                : `${formatCents(remainingCents)} left to allocate`}
            </p>
          </div>
        )}

        <div className="field">
          <label htmlFor="memo">Memo (optional)</label>
          <input id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={kind === 'expense' && (splitInvalid || splitMissingCategory)}
        >
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
