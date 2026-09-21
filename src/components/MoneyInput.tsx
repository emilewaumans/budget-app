interface MoneyInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

/** A plain text input for entering an amount (e.g. "12,34"); parse with parseToCents on submit. */
export function MoneyInput({ id, label, value, onChange }: MoneyInputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
