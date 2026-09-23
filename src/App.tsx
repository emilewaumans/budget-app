import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/BottomNav'
import AccountDetailPage from './features/accounts/AccountDetailPage'
import AccountFormPage from './features/accounts/AccountFormPage'
import AccountsListPage from './features/accounts/AccountsListPage'
import ContributionFormPage from './features/goals/ContributionFormPage'
import GoalDetailPage from './features/goals/GoalDetailPage'
import GoalFormPage from './features/goals/GoalFormPage'
import GoalsPage from './features/goals/GoalsPage'
import HelpPage from './features/help/HelpPage'
import HomePage from './features/home/HomePage'
import { AppLock } from './features/lock/LockContext'
import MorePage from './features/more/MorePage'
import PayeeFormPage from './features/payees/PayeeFormPage'
import PayeesPage from './features/payees/PayeesPage'
import RecurringFormPage from './features/recurring/RecurringFormPage'
import RecurringPage from './features/recurring/RecurringPage'
import ReportsPage from './features/reports/ReportsPage'
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

          <Route path="/accounts" element={<AccountsListPage />} />
          <Route path="/reports" element={<ReportsPage />} />
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

          <Route path="/goals/new" element={<GoalFormPage />} />
          <Route path="/goals/:goalId" element={<GoalDetailPage />} />
          <Route path="/goals/:goalId/edit" element={<GoalFormPage />} />
          <Route path="/goals/:goalId/contributions/new" element={<ContributionFormPage />} />
          <Route
            path="/goals/:goalId/contributions/:contributionId/edit"
            element={<ContributionFormPage />}
          />

          <Route path="/help" element={<HelpPage />} />

          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/recurring/new" element={<RecurringFormPage />} />
          <Route path="/recurring/:templateId/edit" element={<RecurringFormPage />} />

          <Route path="/payees" element={<PayeesPage />} />
          <Route path="/payees/new" element={<PayeeFormPage />} />
          <Route path="/payees/:payeeId/edit" element={<PayeeFormPage />} />
        </Routes>
      </HashRouter>
    </AppLock>
  )
}

export default App
