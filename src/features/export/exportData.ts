import JSZip from 'jszip'
import { db } from '../../db/db'
import { todayISO } from '../../lib/dates'
import { centsToDecimalString } from '../../lib/money'
import { toCsv } from './csv'

async function buildExportZip(): Promise<Blob> {
  const [
    accounts,
    categoryGroups,
    categories,
    transactions,
    splits,
    categoryMonths,
    savingsGoals,
    savingsGoalMonths,
    recurringTemplates,
  ] = await Promise.all([
    db.accounts.toArray(),
    db.categoryGroups.toArray(),
    db.categories.toArray(),
    db.transactions.toArray(),
    db.splits.toArray(),
    db.categoryMonths.toArray(),
    db.savingsGoals.toArray(),
    db.savingsGoalMonths.toArray(),
    db.recurringTemplates.toArray(),
  ])

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]))
  const groupNameById = new Map(categoryGroups.map((g) => [g.id, g.name]))
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
  const goalNameById = new Map(savingsGoals.map((g) => [g.id, g.name]))

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
    'savings_goals.csv',
    toCsv(
      ['id', 'name', 'target_amount', 'target_date', 'note'],
      savingsGoals.map((g) => [
        g.id,
        g.name,
        centsToDecimalString(g.targetCents),
        g.targetDate,
        g.note,
      ]),
    ),
  )

  zip.file(
    'savings_goal_contributions.csv',
    toCsv(
      ['month', 'goal', 'assigned'],
      savingsGoalMonths.map((gm) => [
        gm.month,
        goalNameById.get(gm.goalId) ?? '',
        centsToDecimalString(gm.assignedCents),
      ]),
    ),
  )

  zip.file(
    'recurring_templates.csv',
    toCsv(
      ['name', 'kind', 'payee', 'amount', 'account', 'category', 'memo'],
      recurringTemplates.map((t) => [
        t.name,
        t.kind,
        t.payee,
        centsToDecimalString(t.amountCents),
        accountNameById.get(t.accountId) ?? '',
        categoryNameById.get(t.categoryId) ?? '',
        t.memo,
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
