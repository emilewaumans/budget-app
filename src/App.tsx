import { Navigate, Route, HashRouter, Routes } from 'react-router-dom'
import AccountDetailPage from './features/accounts/AccountDetailPage'
import AccountFormPage from './features/accounts/AccountFormPage'
import AccountsListPage from './features/accounts/AccountsListPage'
import TransactionFormPage from './features/transactions/TransactionFormPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/accounts" replace />} />
        <Route path="/accounts" element={<AccountsListPage />} />
        <Route path="/accounts/new" element={<AccountFormPage />} />
        <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
        <Route path="/accounts/:accountId/edit" element={<AccountFormPage />} />
        <Route path="/accounts/:accountId/transactions/new" element={<TransactionFormPage />} />
        <Route
          path="/accounts/:accountId/transactions/:transactionId/edit"
          element={<TransactionFormPage />}
        />
      </Routes>
    </HashRouter>
  )
}

export default App
