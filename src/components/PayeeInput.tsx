import { useLiveQuery } from 'dexie-react-hooks'
import { BookmarkPlus } from 'lucide-react'
import { db } from '../db/db'

interface PayeeInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

/**
 * A text field for a payee name that suggests saved payees (native datalist, so typing "mu"
 * offers "Muskat") and, only while the typed name doesn't match a saved one, shows a button to
 * save it for next time.
 */
export function PayeeInput({ id, label, value, onChange, required }: PayeeInputProps) {
  const payees = useLiveQuery(() => db.payees.orderBy('name').toArray(), [])

  const trimmed = value.trim()
  const isNew = trimmed.length > 0 && !payees?.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())

  async function handleSave() {
    if (!isNew) return
    await db.payees.add({ id: crypto.randomUUID(), name: trimmed })
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="payee-input">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          list={`${id}-suggestions`}
          placeholder="e.g. Colruyt"
          autoComplete="off"
          required={required}
        />
        {isNew && (
          <button
            type="button"
            className="payee-input__save"
            onClick={handleSave}
            aria-label={`Save "${trimmed}" as a payee`}
          >
            <BookmarkPlus size={18} />
          </button>
        )}
        <datalist id={`${id}-suggestions`}>
          {payees?.map((p) => <option key={p.id} value={p.name} />)}
        </datalist>
      </div>
    </div>
  )
}
