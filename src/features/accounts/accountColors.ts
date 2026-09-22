import { nextPaletteColor, PALETTE_COLORS } from '../../lib/palette'

export const ACCOUNT_COLORS = PALETTE_COLORS
export const DEFAULT_ACCOUNT_COLOR = ACCOUNT_COLORS[0]

/** Rotates through the palette so new accounts don't all default to the same color. */
export function nextAccountColor(existingCount: number): string {
  return nextPaletteColor(existingCount)
}
