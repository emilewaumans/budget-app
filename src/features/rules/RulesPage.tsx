import { useLiveQuery } from 'dexie-react-hooks'
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
        <ul className="list">
          {rules?.map((rule) => (
            <li key={rule.id}>
              <Link className="list-item" to={`/rules/${rule.id}/edit`}>
                <span>
                  <div className="list-item__title">"{rule.matchText}"</div>
                  <div className="list-item__subtitle">
                    {rule.matchType === 'exact' ? 'Exactly matches' : 'Contains'} →{' '}
                    {categoryNameById.get(rule.categoryId) ?? 'Unknown category'}
                  </div>
                </span>
              </Link>
            </li>
          ))}
          {rules?.length === 0 && <li className="list-empty">No rules yet</li>}
        </ul>
      </div>
      <Link to="/rules/new" className="fab" aria-label="Add rule">
        +
      </Link>
    </div>
  )
}
