const KEY = 'budget-app:includedAccountIds'

/** null means "no filter set" — every account counts toward the total. */
export function getIncludedAccountIds(): string[] | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setIncludedAccountIds(ids: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(ids))
}
