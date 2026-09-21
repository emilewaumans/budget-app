/** A curated palette so account colors stay legible in both light and dark mode. */
export const ACCOUNT_COLORS = [
  '#7c3aed', // violet (default accent)
  '#2563eb', // blue
  '#0d9488', // teal
  '#16a34a', // green
  '#ca8a04', // amber
  '#ea580c', // orange
  '#dc2626', // red
  '#db2777', // pink
]

export const DEFAULT_ACCOUNT_COLOR = ACCOUNT_COLORS[0]

/** Rotates through the palette so new accounts don't all default to the same color. */
export function nextAccountColor(existingCount: number): string {
  return ACCOUNT_COLORS[existingCount % ACCOUNT_COLORS.length]
}
