import JSZip from 'jszip'
import { db } from '../../db/db'
import { todayISO } from '../../lib/dates'
import { centsToDecimalString } from '../../lib/money'
import { toCsv } from './csv'

async function buildExportZip(): Promise<Blob> {
  const [accounts, categoryGroups, categories, transactions, splits, categoryMonths, goals] =
    await Promise.all([
      db.accounts.toArray(),
      db.categoryGroups.toArray(),
      db.categories.toArray(),
      db.transactions.toArray(),
      db.splits.toArray(),
      db.categoryMonths.toArray(),
      db.goals.toArray(),
    ])

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]))
  const groupNameById = new Map(categoryGroups.map((g) => [g.id, g.name]))
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  const zip = new JSZip()

  zip.file(
    'accounts.csv',
    toCsv(
      ['id', 'name', 'type', 'starting_balance', 'closed'],
      accounts.map((a) => [a.id, a.name, a.type, centsToDecimalString(a.startingBalanceCents), a.closed]),
    ),
  )

  zip.file(
    'categories.csv',
    toCsv(
      ['id', 'group', 'name'],
      categories.map((c) => [c.id, groupNameById.get(c.groupId) ?? '', c.name]),
    ),
  )

  zip.file(
    'transactions.csv',
    toCsv(
      ['id', 'date', 'account', 'payee', 'memo', 'amount', 'cleared'],
      transactions.map((t) => [
        t.id,
        t.date,
        accountNameById.get(t.accountId) ?? '',
        t.payee,
        t.memo,
        centsToDecimalString(t.amountCents),
        t.cleared,
      ]),
    ),
  )

  zip.file(
    'splits.csv',
    toCsv(
      ['id', 'transaction_id', 'category', 'amount', 'memo'],
      splits.map((s) => [
        s.id,
        s.transactionId,
        categoryNameById.get(s.categoryId) ?? '',
        centsToDecimalString(s.amountCents),
        s.memo,
      ]),
    ),
  )

  zip.file(
    'budget.csv',
    toCsv(
      ['month', 'category', 'assigned'],
      categoryMonths.map((cm) => [
        cm.month,
        categoryNameById.get(cm.categoryId) ?? '',
        centsToDecimalString(cm.assignedCents),
      ]),
    ),
  )

  zip.file(
    'goals.csv',
    toCsv(
      ['category', 'target_amount', 'target_date', 'note'],
      goals.map((g) => [
        categoryNameById.get(g.categoryId) ?? '',
        centsToDecimalString(g.targetCents),
        g.targetDate,
        g.note,
      ]),
    ),
  )

  return zip.generateAsync({ type: 'blob' })
}

export async function downloadExportZip(): Promise<void> {
  const blob = await buildExportZip()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `budget-export-${todayISO()}.zip`
  link.click()
  URL.revokeObjectURL(url)
}
