export type AccountType = 'checking' | 'savings' | 'cash' | 'credit'

export interface Account {
  id: string
  name: string
  type: AccountType
  startingBalanceCents: number
  closed: boolean
  sortOrder: number
  /** Hex color, e.g. '#7c3aed'. Older accounts may not have one — fall back to the default accent. */
  color?: string
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

export type TransactionKind = 'expense' | 'income'

/** A saved template (e.g. "Salary", "Netflix") that pre-fills a new transaction in one tap. */
export interface RecurringTemplate {
  id: string
  name: string
  kind: TransactionKind
  payee: string
  amountCents: number
  accountId: string
  /** Empty string means uncategorized; unused for income. */
  categoryId: string
  memo: string
  sortOrder: number
}
