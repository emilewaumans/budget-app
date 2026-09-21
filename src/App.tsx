import { useLiveQuery } from 'dexie-react-hooks'
import './App.css'
import { db } from './db/db'
import { formatCents } from './lib/money'

function addSampleAccount() {
  db.accounts.add({
    id: crypto.randomUUID(),
    name: 'Checking',
    type: 'checking',
    startingBalanceCents: 100000,
    closed: false,
    sortOrder: 0,
  })
}

function clearAccounts() {
  db.accounts.clear()
}

function App() {
  const accounts = useLiveQuery(() => db.accounts.toArray(), [])

  return (
    <div className="app-shell">
      <h1>Budget</h1>
      <p>Data layer check (temporary — replaced by the real Accounts screen next)</p>

      <ul className="db-check-list">
        {accounts?.map((account) => (
          <li key={account.id}>
            {account.name} — {formatCents(account.startingBalanceCents)}
          </li>
        ))}
        {accounts?.length === 0 && <li>No accounts yet</li>}
      </ul>

      <div className="db-check-actions">
        <button onClick={addSampleAccount}>Add sample account</button>
        <button onClick={clearAccounts}>Clear</button>
      </div>
    </div>
  )
}

export default App
