import type { ChangeEvent } from 'react'
import type { CustomPeriodUnit, RecurringPeriodKind } from '../db/types'
import { PERIOD_PRESET_LABELS } from '../features/recurring/period'

export interface PeriodValue {
  kind: RecurringPeriodKind
  customCount: number
  customUnit: CustomPeriodUnit
}

const PRESETS = (Object.keys(PERIOD_PRESET_LABELS) as Array<keyof typeof PERIOD_PRESET_LABELS>).map((value) => ({
  value,
  label: PERIOD_PRESET_LABELS[value],
}))

const CUSTOM_OPTION = '__custom__'

interface PeriodInputProps {
  value: PeriodValue
  onChange: (value: PeriodValue) => void
}

/**
 * How often a recurring template repeats — a scrollable picker of presets (Daily, Weekly, ...)
 * with a "+ Custom..." option that switches to a count + unit field, mirroring the payee picker.
 */
export function PeriodInput({ value, onChange }: PeriodInputProps) {
  if (value.kind === 'custom') {
    return (
      <div className="field">
        <label htmlFor="periodCount">Repeats every</label>
        <div className="period-custom">
          <input
            id="periodCount"
            type="number"
            inputMode="numeric"
            min={1}
            value={value.customCount}
            onChange={(e) => onChange({ ...value, customCount: Math.max(1, Number(e.target.value) || 1) })}
          />
          <select
            value={value.customUnit}
            onChange={(e) => onChange({ ...value, customUnit: e.target.value as CustomPeriodUnit })}
          >
            <option value="days">Day(s)</option>
            <option value="weeks">Week(s)</option>
            <option value="months">Month(s)</option>
          </select>
        </div>
        <button
          type="button"
          className="payee-input__switch"
          onClick={() => onChange({ ...value, kind: 'monthly' })}
        >
          Choose a preset instead
        </button>
      </div>
    )
  }

  function handlePickerChange(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === CUSTOM_OPTION) {
      onChange({ ...value, kind: 'custom' })
      return
    }
    onChange({ ...value, kind: e.target.value as RecurringPeriodKind })
  }

  return (
    <div className="field">
      <label htmlFor="period">Repeats</label>
      <select id="period" value={value.kind} onChange={handlePickerChange} required>
        {PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
        <option value={CUSTOM_OPTION}>+ Custom…</option>
      </select>
    </div>
  )
}
