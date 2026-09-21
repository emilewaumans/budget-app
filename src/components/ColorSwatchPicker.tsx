import { Check } from 'lucide-react'

interface ColorSwatchPickerProps {
  colors: string[]
  value: string
  onChange: (color: string) => void
}

export function ColorSwatchPicker({ colors, value, onChange }: ColorSwatchPickerProps) {
  return (
    <div className="swatch-picker">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className="swatch"
          style={{ background: color }}
          aria-label={`Choose color ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
        >
          {value === color && <Check size={16} color="#fff" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}
