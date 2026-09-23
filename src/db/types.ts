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

/**
 * A savings goal (e.g. "New watch", "Vacation") — its own concept, separate from spending.
 * Its progress comes entirely from its own contribution log (see SavingsGoalContribution),
 * not from anything assigned/spent elsewhere in the app.
 */
export interface SavingsGoal {
  id: string
  name: string
  targetCents: number
  /** Format: 'YYYY-MM-DD' */
  targetDate: string
  note: string
  sortOrder: number
}

/**
 * One logged deposit or withdrawal toward a goal — the "log book" entry. Positive amountCents
 * is money set aside; negative is money taken back out. Saved-so-far is just the running sum.
 */
export interface SavingsGoalContribution {
  id: string
  goalId: string
  /** Format: 'YYYY-MM-DD' */
  date: string
  amountCents: number
  note: string
}

/** A saved payee (e.g. "Colruyt", "My Employer") people can pick instead of retyping. */
export interface Payee {
  id: string
  name: string
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
  memo: string
  sortOrder: number
}
