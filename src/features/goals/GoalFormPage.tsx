import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import { centsToInputString, parseToCents } from '../../lib/money'

export default function GoalFormPage() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(goalId)

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [note, setNote] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!goalId) return
    db.savingsGoals.get(goalId).then((goal) => {
      if (!goal) return
      setName(goal.name)
      setTargetAmount(centsToInputString(goal.targetCents))
      setTargetDate(goal.targetDate)
      setNote(goal.note)
    })
  }, [goalId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !targetDate) return

    const targetCents = parseToCents(targetAmount)

    if (isEditing && goalId) {
      await db.savingsGoals.update(goalId, {
        name: name.trim(),
        targetCents,
        targetDate,
        note: note.trim(),
      })
    } else {
      const count = await db.savingsGoals.count()
      await db.savingsGoals.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        targetCents,
        targetDate,
        note: note.trim(),
        sortOrder: count,
      })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!goalId) return
    await db.savingsGoalMonths.where('goalId').equals(goalId).delete()
    await db.savingsGoals.delete(goalId)
    navigate('/goals')
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit savings goal' : 'New savings goal'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">What are you saving for?</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. New watch, Vacation"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="targetAmount">Target amount</label>
          <input
            id="targetAmount"
            type="text"
            inputMode="decimal"
            placeholder="500,00"
            value={targetAmount}
            onFocus={(e) => {
              if (parseToCents(e.target.value) === 0) setTargetAmount('')
            }}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="targetDate">Target date</label>
          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="note">Note (optional)</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && !confirmingDelete && (
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 size={18} /> Delete goal
          </button>
        )}

        {isEditing && confirmingDelete && (
          <div className="confirm-box">
            <p>Delete this savings goal? This can't be undone.</p>
            <div className="confirm-box__actions">
              <button type="button" className="btn" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete permanently
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
