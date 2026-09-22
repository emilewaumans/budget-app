/** A curated palette so user-picked colors stay legible in both light and dark mode. */
export const PALETTE_COLORS = [
  '#7c3aed', // violet (default accent)
  '#2563eb', // blue
  '#0d9488', // teal
  '#16a34a', // green
  '#ca8a04', // amber
  '#ea580c', // orange
  '#dc2626', // red
  '#db2777', // pink
]

/** Rotates through the palette so a set of items don't all default to the same color. */
export function nextPaletteColor(existingCount: number): string {
  return PALETTE_COLORS[existingCount % PALETTE_COLORS.length]
}
