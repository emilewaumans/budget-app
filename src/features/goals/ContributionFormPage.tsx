import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { todayISO } from '../../lib/dates'
import { centsToInputString, parseToCents } from '../../lib/money'

type ContributionKind = 'deposit' | 'withdraw'

export default function ContributionFormPage() {
  const { goalId, contributionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(contributionId)

  const [kind, setKind] = useState<ContributionKind>(
    searchParams.get('kind') === 'withdraw' ? 'withdraw' : 'deposit',
  )
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!contributionId) return
    db.savingsGoalContributions.get(contributionId).then((c) => {
      if (!c) return
      setKind(c.amountCents < 0 ? 'withdraw' : 'deposit')
      setAmount(centsToInputString(Math.abs(c.amountCents)))
      setDate(c.date)
      setNote(c.note)
    })
  }, [contributionId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goalId) return

    const magnitude = Math.abs(parseToCents(amount))
    const amountCents = kind === 'withdraw' ? -magnitude : magnitude

    if (isEditing && contributionId) {
      await db.savingsGoalContributions.update(contributionId, {
        date,
        amountCents,
        note: note.trim(),
      })
    } else {
      await db.savingsGoalContributions.add({
        id: crypto.randomUUID(),
        goalId,
        date,
        amountCents,
        note: note.trim(),
      })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!contributionId) return
    await db.savingsGoalContributions.delete(contributionId)
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit entry' : 'Log savings'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="segmented">
          <button
            type="button"
            className={kind === 'deposit' ? 'active income' : undefined}
            onClick={() => setKind('deposit')}
          >
            <ArrowDownLeft size={16} /> Deposit
          </button>
          <button
            type="button"
            className={kind === 'withdraw' ? 'active expense' : undefined}
            onClick={() => setKind('withdraw')}
          >
            <ArrowUpRight size={16} /> Withdraw
          </button>
        </div>

        <MoneyInput id="amount" label="Amount" value={amount} onChange={setAmount} />

        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="note">Note (optional)</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && (
          <button type="button" className="btn btn-danger btn-block" onClick={handleDelete}>
            <Trash2 size={18} /> Delete entry
          </button>
        )}
      </form>
    </div>
  )
}
