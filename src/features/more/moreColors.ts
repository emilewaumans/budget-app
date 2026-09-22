const KEY = 'budget-app:moreItemColors'

export function getMoreItemColors(): Record<string, string> {
  const raw = localStorage.getItem(KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function setMoreItemColors(colors: Record<string, string>): void {
  localStorage.setItem(KEY, JSON.stringify(colors))
}
