import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/BottomNav'
import AccountDetailPage from './features/accounts/AccountDetailPage'
import AccountFormPage from './features/accounts/AccountFormPage'
import AccountsListPage from './features/accounts/AccountsListPage'
import BudgetPage from './features/budget/BudgetPage'
import CategoriesPage from './features/categories/CategoriesPage'
import CategoryFormPage from './features/categories/CategoryFormPage'
import CategoryGroupFormPage from './features/categories/CategoryGroupFormPage'
import GoalFormPage from './features/goals/GoalFormPage'
import GoalsPage from './features/goals/GoalsPage'
import HelpPage from './features/help/HelpPage'
import HomePage from './features/home/HomePage'
import { AppLock } from './features/lock/LockContext'
import MorePage from './features/more/MorePage'
import RecurringFormPage from './features/recurring/RecurringFormPage'
import RecurringPage from './features/recurring/RecurringPage'
import ReportsPage from './features/reports/ReportsPage'
import RuleFormPage from './features/rules/RuleFormPage'
import RulesPage from './features/rules/RulesPage'
import SettingsPage from './features/settings/SettingsPage'
import TransactionFormPage from './features/transactions/TransactionFormPage'

function App() {
  return (
    <AppLock>
      <HashRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/more" element={<MorePage />} />
          </Route>

          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/accounts" element={<AccountsListPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/transactions/new" element={<TransactionFormPage />} />

          <Route path="/accounts/new" element={<AccountFormPage />} />
          <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
          <Route path="/accounts/:accountId/edit" element={<AccountFormPage />} />
          <Route path="/accounts/:accountId/transactions/new" element={<TransactionFormPage />} />
          <Route
            path="/accounts/:accountId/transactions/:transactionId/edit"
            element={<TransactionFormPage />}
          />

          <Route path="/categories/groups/new" element={<CategoryGroupFormPage />} />
          <Route path="/categories/groups/:groupId/edit" element={<CategoryGroupFormPage />} />
          <Route path="/categories/groups/:groupId/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories/:categoryId/edit" element={<CategoryFormPage />} />

          <Route path="/goals/new" element={<GoalFormPage />} />
          <Route path="/goals/:goalId/edit" element={<GoalFormPage />} />

          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules/new" element={<RuleFormPage />} />
          <Route path="/rules/:ruleId/edit" element={<RuleFormPage />} />

          <Route path="/help" element={<HelpPage />} />

          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/recurring/new" element={<RecurringFormPage />} />
          <Route path="/recurring/:templateId/edit" element={<RecurringFormPage />} />
        </Routes>
      </HashRouter>
    </AppLock>
  )
}

export default App
