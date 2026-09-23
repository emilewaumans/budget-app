import { useLiveQuery } from 'dexie-react-hooks'
import { BookmarkPlus } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { db } from '../db/db'

interface PayeeInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

const TYPE_NEW = '__type_new__'

/**
 * A payee field that starts as a scrollable picker of saved payees (like the Account select) —
 * with an option to type a new one instead, which switches to a text field with native
 * suggestions and a button to save whatever's typed. Falls back straight to the text field when
 * there's nothing saved yet, or when editing a transaction whose payee isn't a saved one.
 */
export function PayeeInput({ id, label, value, onChange, required }: PayeeInputProps) {
  const payees = useLiveQuery(() => db.payees.orderBy('name').toArray(), [])
  const [mode, setMode] = useState<'picker' | 'typing'>('typing')
  const [focusOnSwitch, setFocusOnSwitch] = useState(false)
  const initialized = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialized.current || !payees) return
    initialized.current = true
    const trimmed = value.trim()
    const matchesSaved = trimmed === '' || payees.some((p) => p.name === trimmed)
    setMode(payees.length > 0 && matchesSaved ? 'picker' : 'typing')
  }, [payees, value])

  useLayoutEffect(() => {
    if (mode === 'typing' && focusOnSwitch) {
      inputRef.current?.focus()
      setFocusOnSwitch(false)
    }
  }, [mode, focusOnSwitch])

  function switchToTyping(clearValue: boolean) {
    if (clearValue) onChange('')
    setFocusOnSwitch(true)
    setMode('typing')
  }

  const trimmed = value.trim()
  const isNew = trimmed.length > 0 && !payees?.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())

  async function handleSave() {
    if (!isNew) return
    await db.payees.add({ id: crypto.randomUUID(), name: trimmed })
  }

  function handlePickerChange(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === TYPE_NEW) {
      switchToTyping(true)
      return
    }
    onChange(e.target.value)
  }

  if (mode === 'picker') {
    const selectValue = payees?.some((p) => p.name === value) ? value : ''
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={selectValue} onChange={handlePickerChange} required={required}>
          <option value="" disabled>
            Choose a payee
          </option>
          <option value={TYPE_NEW}>+ Type a new payee…</option>
          {payees?.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="payee-input">
        <input
          ref={inputRef}
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
      {payees && payees.length > 0 && (
        <button type="button" className="payee-input__switch" onClick={() => setMode('picker')}>
          Choose from saved payees instead
        </button>
      )}
    </div>
  )
}
