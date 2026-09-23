import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function PayeesPage() {
  const payees = useLiveQuery(() => db.payees.orderBy('name').toArray(), [])

  return (
    <div className="page">
      <PageHeader title="Payees" back helpTopic="payees" />
      <div className="page-body">
        {payees?.length === 0 && (
          <div className="empty-state">
            <Users size={40} strokeWidth={1.5} />
            <h2>No saved payees yet</h2>
            <p>
              Save the people and places you pay or get paid by often, so you can pick them
              instead of retyping.
            </p>
          </div>
        )}

        {payees && payees.length > 0 && (
          <ul className="list">
            {payees.map((payee) => (
              <li key={payee.id}>
                <Link className="list-item" to={`/payees/${payee.id}/edit`}>
                  <span className="list-item__title">{payee.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link to="/payees/new" className="fab" aria-label="Add payee">
        <Plus size={26} />
      </Link>
    </div>
  )
}
