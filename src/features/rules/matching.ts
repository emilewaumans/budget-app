import type { CategorizationRule } from '../../db/types'

/** Exact-match rules win over contains-match rules; ties broken by earliest-created (lowest priority). */
export function findMatchingRule(
  rules: CategorizationRule[],
  payee: string,
): CategorizationRule | undefined {
  const value = payee.trim().toLowerCase()
  if (!value) return undefined

  const sorted = [...rules].sort((a, b) => a.priority - b.priority)

  const exact = sorted.find(
    (r) => r.matchType === 'exact' && r.matchText.trim().toLowerCase() === value,
  )
  if (exact) return exact

  return sorted.find(
    (r) => r.matchType === 'contains' && value.includes(r.matchText.trim().toLowerCase()),
  )
}
