import { useState } from 'react'
import { centsToInputString, parseToCents } from '../../lib/money'

interface AssignedInputProps {
  value: number
  onCommit: (cents: number) => void
}

/** An inline-editable amount — shows the stored value until focused, then edits freely until blur commits it. */
export function AssignedInput({ value, onCommit }: AssignedInputProps) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <input
      className="assigned-input"
      type="text"
      inputMode="decimal"
      value={draft ?? centsToInputString(value)}
      onFocus={() => setDraft(value === 0 ? '' : centsToInputString(value))}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== null) onCommit(parseToCents(draft))
        setDraft(null)
      }}
    />
  )
}
