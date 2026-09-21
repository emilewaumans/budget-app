import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import type { AccountType } from '../../db/types'
import { centsToInputString, parseToCents } from '../../lib/money'
import { ACCOUNT_COLORS, nextAccountColor } from './accountColors'
import { ACCOUNT_TYPE_OPTIONS } from './accountTypes'

export default function AccountFormPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(accountId)

  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [startingBalance, setStartingBalance] = useState('0,00')
  const [closed, setClosed] = useState(false)
  const [color, setColor] = useState(ACCOUNT_COLORS[0])
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const accountCount = useLiveQuery(() => db.accounts.count(), [])

  useEffect(() => {
    if (!isEditing && accountCount !== undefined) {
      setColor(nextAccountColor(accountCount))
    }
  }, [isEditing, accountCount])

  const transactionCount = useLiveQuery(
    () => (accountId ? db.transactions.where('accountId').equals(accountId).count() : 0),
    [accountId],
  )

  useEffect(() => {
    if (!accountId) return
    db.accounts.get(accountId).then((account) => {
      if (!account) return
      setName(account.name)
      setType(account.type)
      setStartingBalance(centsToInputString(account.startingBalanceCents))
      setClosed(account.closed)
      setColor(account.color ?? ACCOUNT_COLORS[0])
    })
  }, [accountId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing && accountId) {
      await db.accounts.update(accountId, {
        name: name.trim(),
        type,
        startingBalanceCents: parseToCents(startingBalance),
        closed,
        color,
      })
    } else {
      const count = await db.accounts.count()
      await db.accounts.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        startingBalanceCents: parseToCents(startingBalance),
        closed: false,
        sortOrder: count,
        color,
      })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!accountId) return
    const transactionIds = await db.transactions
      .where('accountId')
      .equals(accountId)
      .primaryKeys()
    await db.splits.where('transactionId').anyOf(transactionIds).delete()
    await db.transactions.where('accountId').equals(accountId).delete()
    await db.accounts.delete(accountId)
    navigate('/accounts')
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit account' : 'New account'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Checking"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            {ACCOUNT_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <MoneyInput
          id="startingBalance"
          label="Starting balance"
          value={startingBalance}
          onChange={setStartingBalance}
        />

        <div className="field">
          <label>Color</label>
          <ColorSwatchPicker colors={ACCOUNT_COLORS} value={color} onChange={setColor} />
        </div>

        {isEditing && (
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => setClosed(e.target.checked)}
                style={{ width: 'auto', marginRight: '0.5rem' }}
              />
              Closed (hides it from the main list, keeps its history)
            </label>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && !confirmingDelete && (
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 size={18} /> Delete account
          </button>
        )}

        {isEditing && confirmingDelete && (
          <div className="confirm-box">
            <p>
              Delete this account and its {transactionCount ?? 0} transaction
              {transactionCount === 1 ? '' : 's'}? This can't be undone.
            </p>
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
