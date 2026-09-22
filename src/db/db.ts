import Dexie, { type EntityTable } from 'dexie'
import type {
  Account,
  Category,
  CategoryGroup,
  CategoryMonth,
  CategorizationRule,
  RecurringTemplate,
  SavingsGoal,
  SavingsGoalMonth,
  Split,
  Transaction,
} from './types'

class BudgetDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  categoryGroups!: EntityTable<CategoryGroup, 'id'>
  categories!: EntityTable<Category, 'id'>
  categoryMonths!: EntityTable<CategoryMonth, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  splits!: EntityTable<Split, 'id'>
  rules!: EntityTable<CategorizationRule, 'id'>
  recurringTemplates!: EntityTable<RecurringTemplate, 'id'>
  savingsGoals!: EntityTable<SavingsGoal, 'id'>
  savingsGoalMonths!: EntityTable<SavingsGoalMonth, 'id'>

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
  }
}

export const db = new BudgetDB()
