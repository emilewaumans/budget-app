export type AccountType = 'checking' | 'savings' | 'cash' | 'credit'

export interface Account {
  id: string
  name: string
  type: AccountType
  startingBalanceCents: number
  closed: boolean
  sortOrder: number
}

export interface CategoryGroup {
  id: string
  name: string
  sortOrder: number
}

export interface Category {
  id: string
  groupId: string
  name: string
  sortOrder: number
}

/** One row per category per month — the only place a "budgeted amount" is stored. */
export interface CategoryMonth {
  id: string
  categoryId: string
  /** Format: 'YYYY-MM' */
  month: string
  assignedCents: number
}

export interface Transaction {
  id: string
  accountId: string
  /** Format: 'YYYY-MM-DD' */
  date: string
  payee: string
  memo: string
  cleared: boolean
  amountCents: number
}

/** Every transaction has at least one split — single- and multi-category transactions share this one code path. */
export interface Split {
  id: string
  transactionId: string
  categoryId: string
  amountCents: number
  memo: string
}

export type RuleMatchType = 'contains' | 'exact'

export interface CategorizationRule {
  id: string
  matchText: string
  matchType: RuleMatchType
  categoryId: string
  priority: number
}

export interface Goal {
  id: string
  categoryId: string
  targetCents: number
  /** Format: 'YYYY-MM-DD' */
  targetDate: string
  note: string
}
