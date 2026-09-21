import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MoneyInput } from '../../components/MoneyInput'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import type { AccountType } from '../../db/types'
import { centsToInputString, parseToCents } from '../../lib/money'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit card' },
]

export default function AccountFormPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(accountId)

  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [startingBalance, setStartingBalance] = useState('0,00')
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!accountId) return
    db.accounts.get(accountId).then((account) => {
      if (!account) return
      setName(account.name)
      setType(account.type)
      setStartingBalance(centsToInputString(account.startingBalanceCents))
      setClosed(account.closed)
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
      })
    }
    navigate(-1)
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
            {ACCOUNT_TYPES.map((t) => (
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

        {isEditing && (
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => setClosed(e.target.checked)}
                style={{ width: 'auto', marginRight: '0.5rem' }}
              />
              Closed
            </label>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>
      </form>
    </div>
  )
}
