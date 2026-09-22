import { db } from '../../db/db'
import type { RecurringTemplate } from '../../db/types'
import { todayISO } from '../../lib/dates'

/** Creates today's transaction from a saved recurring template and returns its new id. */
export async function createTransactionFromTemplate(template: RecurringTemplate): Promise<string> {
  const magnitude = Math.abs(template.amountCents)
  const amountCents = template.kind === 'expense' ? -magnitude : magnitude

  const transactionId = crypto.randomUUID()
  await db.transactions.add({
    id: transactionId,
    accountId: template.accountId,
    date: todayISO(),
    payee: template.payee,
    memo: template.memo,
    cleared: false,
    amountCents,
  })

  return transactionId
}
