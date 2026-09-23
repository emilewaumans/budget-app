import Dexie, { type EntityTable } from 'dexie'
import type {
  Account,
  Payee,
  RecurringTemplate,
  SavingsGoal,
  SavingsGoalContribution,
  Transaction,
} from './types'

class BudgetDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  recurringTemplates!: EntityTable<RecurringTemplate, 'id'>
  savingsGoals!: EntityTable<SavingsGoal, 'id'>
  savingsGoalContributions!: EntityTable<SavingsGoalContribution, 'id'>
  payees!: EntityTable<Payee, 'id'>

  constructor() {
    super('budgetdb')

    this.version(1).stores({
      accounts: 'id, name, type, closed, sortOrder',
      categoryGroups: 'id, name, sortOrder',
      categories: 'id, groupId, name, sortOrder',
      categoryMonths: 'id, [categoryId+month], month',
      transactions: 'id, accountId, date, payee, cleared',
      splits: 'id, transactionId, categoryId',
      rules: 'id, matchText, categoryId, priority',
      goals: 'id, categoryId',
    })

    this.version(2).stores({
      accounts: 'id, name, type, closed, sortOrder',
      categoryGroups: 'id, name, sortOrder',
      categories: 'id, groupId, name, sortOrder',
      categoryMonths: 'id, [categoryId+month], month',
      transactions: 'id, accountId, date, payee, cleared',
      splits: 'id, transactionId, categoryId',
      rules: 'id, matchText, categoryId, priority',
      goals: 'id, categoryId',
      recurringTemplates: 'id, sortOrder',
    })

    // Savings goals become their own concept (see SavingsGoal in types.ts) instead of living
    // on a category, so the old category-linked `goals` store is dropped here.
    this.version(3).stores({
      accounts: 'id, name, type, closed, sortOrder',
      categoryGroups: 'id, name, sortOrder',
      categories: 'id, groupId, name, sortOrder',
      categoryMonths: 'id, [categoryId+month], month',
      transactions: 'id, accountId, date, payee, cleared',
      splits: 'id, transactionId, categoryId',
      rules: 'id, matchText, categoryId, priority',
      goals: null,
      recurringTemplates: 'id, sortOrder',
      savingsGoals: 'id, sortOrder',
      savingsGoalMonths: 'id, [goalId+month], month',
    })

    // Categories, budgeting, categorization rules, and splits are removed entirely — a
    // transaction is now just amount/payee/account/date. Savings goals switch from a single
    // editable monthly total to a proper contribution log (see SavingsGoalContribution).
    this.version(4).stores({
      accounts: 'id, name, type, closed, sortOrder',
      categoryGroups: null,
      categories: null,
      categoryMonths: null,
      transactions: 'id, accountId, date, payee, cleared',
      splits: null,
      rules: null,
      recurringTemplates: 'id, sortOrder',
      savingsGoals: 'id, sortOrder',
      savingsGoalMonths: null,
      savingsGoalContributions: 'id, goalId, date',
    })

    // Saved payees people can pick from instead of retyping, separate from the ad-hoc
    // "distinct payees seen so far" list transactions used to build suggestions from.
    this.version(5).stores({
      accounts: 'id, name, type, closed, sortOrder',
      categoryGroups: null,
      categories: null,
      categoryMonths: null,
      transactions: 'id, accountId, date, payee, cleared',
      splits: null,
      rules: null,
      recurringTemplates: 'id, sortOrder',
      savingsGoals: 'id, sortOrder',
      savingsGoalMonths: null,
      savingsGoalContributions: 'id, goalId, date',
      payees: 'id, name',
    })
  }
}

export const db = new BudgetDB()
