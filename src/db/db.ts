import Dexie, { type EntityTable } from 'dexie'
import type {
  Account,
  Category,
  CategoryGroup,
  CategoryMonth,
  CategorizationRule,
  Goal,
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
  goals!: EntityTable<Goal, 'id'>

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
  }
}

export const db = new BudgetDB()
