import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function RulesPage() {
  const rules = useLiveQuery(() => db.rules.orderBy('priority').toArray(), [])
  const categories = useLiveQuery(() => db.categories.toArray(), [])
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]))

  return (
    <div className="page">
      <PageHeader title="Categorization rules" back />
      <div className="page-body">
        <p className="list-item__subtitle">
          When a transaction's payee matches a rule, its category is auto-suggested (still
          editable) on the add-transaction form.
        </p>

        {rules && rules.length > 0 && (
          <ul className="list">
            {rules.map((rule) => (
              <li key={rule.id}>
                <Link className="list-item" to={`/rules/${rule.id}/edit`}>
                  <span className="list-item__text">
                    <div className="list-item__title">"{rule.matchText}"</div>
                    <div className="list-item__subtitle">
                      {rule.matchType === 'exact' ? 'Exactly matches' : 'Contains'} →{' '}
                      {categoryNameById.get(rule.categoryId) ?? 'Unknown category'}
                    </div>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {rules?.length === 0 && (
          <div className="empty-state">
            <SlidersHorizontal size={40} strokeWidth={1.5} />
            <h2>No rules yet</h2>
            <p>
              A rule like "Colruyt" → Groceries auto-fills the category next time you log a
              transaction from that payee.
            </p>
          </div>
        )}
      </div>
      <Link to="/rules/new" className="fab" aria-label="Add rule">
        <Plus size={26} />
      </Link>
    </div>
  )
}
