import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import type { Transaction } from '../../db/types'

/** Maps each transaction id to its category name, or "Split" when it has more than one. */
export function useCategoryLabels(transactions: Transaction[] | undefined) {
  return useLiveQuery(async () => {
    if (!transactions || transactions.length === 0) return new Map<string, string>()
    const transactionIds = transactions.map((t) => t.id)
    const [splits, categories] = await Promise.all([
      db.splits.where('transactionId').anyOf(transactionIds).toArray(),
      db.categories.toArray(),
    ])
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
    const splitsByTransactionId = new Map<string, typeof splits>()
    for (const split of splits) {
      const list = splitsByTransactionId.get(split.transactionId) ?? []
      list.push(split)
      splitsByTransactionId.set(split.transactionId, list)
    }
    const result = new Map<string, string>()
    for (const [transactionId, txSplits] of splitsByTransactionId) {
      if (txSplits.length > 1) {
        result.set(transactionId, 'Split')
      } else {
        const name = categoryNameById.get(txSplits[0].categoryId)
        if (name) result.set(transactionId, name)
      }
    }
    return result
  }, [transactions])
}
