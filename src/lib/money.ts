const formatter = new Intl.NumberFormat('nl-BE', {
  style: 'currency',
  currency: 'EUR',
})

/** Formats integer cents as a localized euro string, e.g. 123456 -> "€ 1.234,56". */
export function formatCents(cents: number): string {
  return formatter.format(cents / 100)
}

/** Parses a user-typed amount (e.g. "12,34" or "12.34") into integer cents. */
export function parseToCents(input: string): number {
  const normalized = input.trim().replace(',', '.')
  const value = Number.parseFloat(normalized)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

/** Formats integer cents as a plain editable string (e.g. 1234 -> "12,34", -1234 -> "-12,34") for form inputs. */
export function centsToInputString(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

/** Formats integer cents with a period decimal (e.g. 1234 -> "12.34") for CSV export — locale-independent. */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2)
}
