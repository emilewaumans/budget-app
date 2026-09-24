import JSZip from 'jszip'
import { db } from '../../db/db'
import { formatPeriod } from '../recurring/period'
import { todayISO } from '../../lib/dates'
import { centsToDecimalString } from '../../lib/money'
import { toCsv } from './csv'

async function buildExportZip(): Promise<Blob> {
  const [accounts, transactions, savingsGoals, savingsGoalContributions, recurringTemplates, payees] =
    await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
      db.savingsGoals.toArray(),
      db.savingsGoalContributions.toArray(),
      db.recurringTemplates.toArray(),
      db.payees.toArray(),
    ])

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]))
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
    'savings_goal_log.csv',
    toCsv(
      ['date', 'goal', 'amount', 'note'],
      savingsGoalContributions.map((c) => [
        c.date,
        goalNameById.get(c.goalId) ?? '',
        centsToDecimalString(c.amountCents),
        c.note,
      ]),
    ),
  )

  zip.file(
    'recurring_templates.csv',
    toCsv(
      ['name', 'kind', 'payee', 'amount', 'account', 'memo', 'repeats'],
      recurringTemplates.map((t) => [
        t.name,
        t.kind,
        t.payee,
        centsToDecimalString(t.amountCents),
        accountNameById.get(t.accountId) ?? '',
        t.memo,
        formatPeriod(t.periodKind, t.customPeriodCount, t.customPeriodUnit),
      ]),
    ),
  )

  zip.file('payees.csv', toCsv(['id', 'name'], payees.map((p) => [p.id, p.name])))

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
