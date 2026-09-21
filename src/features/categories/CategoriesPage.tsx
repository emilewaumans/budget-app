import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'

export default function CategoriesPage() {
  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Categories</h1>
      </header>
      <div className="page-body">
        <Link to="/rules" className="btn">
          Manage categorization rules
        </Link>

        {groups?.map((group) => (
          <div key={group.id} className="category-group">
            <Link to={`/categories/groups/${group.id}/edit`} className="category-group__title">
              <h3>{group.name}</h3>
            </Link>
            <ul className="list">
              {categories
                ?.filter((c) => c.groupId === group.id)
                .map((category) => (
                  <li key={category.id}>
                    <Link className="list-item" to={`/categories/${category.id}/edit`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  className="list-item list-item--muted"
                  to={`/categories/groups/${group.id}/categories/new`}
                >
                  + Add category
                </Link>
              </li>
            </ul>
          </div>
        ))}
        {groups?.length === 0 && <p className="list-empty">No category groups yet</p>}
      </div>
      <Link to="/categories/groups/new" className="fab fab--above-nav" aria-label="Add category group">
        +
      </Link>
    </div>
  )
}
