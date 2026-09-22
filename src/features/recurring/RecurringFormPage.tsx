import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import type { TransactionKind } from '../../db/types'
import { centsToInputString, parseToCents } from '../../lib/money'

export default function RecurringFormPage() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(templateId)

  const [name, setName] = useState('')
  const [kind, setKind] = useState<TransactionKind>('expense')
  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [memo, setMemo] = useState('')

  const openAccounts = useLiveQuery(
    () => db.accounts.filter((a) => !a.closed).sortBy('sortOrder'),
    [],
  )
  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])

  useEffect(() => {
    if (!accountId && openAccounts && openAccounts.length > 0) {
      setAccountId(openAccounts[0].id)
    }
  }, [accountId, openAccounts])

  useEffect(() => {
    if (!templateId) return
    db.recurringTemplates.get(templateId).then((template) => {
      if (!template) return
      setName(template.name)
      setKind(template.kind)
      setPayee(template.payee)
      setAmount(centsToInputString(template.amountCents))
      setAccountId(template.accountId)
      setCategoryId(template.categoryId)
      setMemo(template.memo)
    })
  }, [templateId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !payee.trim() || !accountId) return

    const amountCents = Math.abs(parseToCents(amount))

    if (isEditing && templateId) {
      await db.recurringTemplates.update(templateId, {
        name: name.trim(),
        kind,
        payee: payee.trim(),
        amountCents,
        accountId,
        categoryId: kind === 'expense' ? categoryId : '',
        memo: memo.trim(),
      })
    } else {
      const count = await db.recurringTemplates.count()
      await db.recurringTemplates.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        kind,
        payee: payee.trim(),
        amountCents,
        accountId,
        categoryId: kind === 'expense' ? categoryId : '',
        memo: memo.trim(),
        sortOrder: count,
      })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!templateId) return
    await db.recurringTemplates.delete(templateId)
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit recurring' : 'New recurring'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Salary"
            required
          />
        </div>

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

        <div className="field">
          <label htmlFor="account">Account</label>
          <select id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
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

        <MoneyInput id="amount" label="Amount" value={amount} onChange={setAmount} />

        <div className="field">
          <label htmlFor="payee">Payee</label>
          <input
            id="payee"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            placeholder="e.g. My Employer"
            required
          />
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
            <Trash2 size={18} /> Delete recurring
          </button>
        )}
      </form>
    </div>
  )
}
