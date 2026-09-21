import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/BottomNav'
import AccountDetailPage from './features/accounts/AccountDetailPage'
import AccountFormPage from './features/accounts/AccountFormPage'
import AccountsListPage from './features/accounts/AccountsListPage'
import BudgetPage from './features/budget/BudgetPage'
import CategoriesPage from './features/categories/CategoriesPage'
import CategoryFormPage from './features/categories/CategoryFormPage'
import CategoryGroupFormPage from './features/categories/CategoryGroupFormPage'
import RuleFormPage from './features/rules/RuleFormPage'
import RulesPage from './features/rules/RulesPage'
import TransactionFormPage from './features/transactions/TransactionFormPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/budget" replace />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/accounts" element={<AccountsListPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>

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

        <Route path="/rules" element={<RulesPage />} />
        <Route path="/rules/new" element={<RuleFormPage />} />
        <Route path="/rules/:ruleId/edit" element={<RuleFormPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
