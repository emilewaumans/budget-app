import type { Account, Transaction } from '../../db/types'

/** An account's balance is derived from its starting balance plus its transactions, never stored. */
export function computeAccountBalance(account: Account, transactions: Transaction[]): number {
  const total = transactions
    .filter((t) => t.accountId === account.id)
    .reduce((sum, t) => sum + t.amountCents, 0)
  return account.startingBalanceCents + total
}
