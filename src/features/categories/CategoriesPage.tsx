import { useLiveQuery } from 'dexie-react-hooks'
import { FolderOpen, Plus, SlidersHorizontal, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function CategoriesPage() {
  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])

  return (
    <div className="page">
      <PageHeader title="Categories" back />
      <div className="page-body">
        <Link to="/rules" className="btn">
          <SlidersHorizontal size={16} /> Categorization rules
        </Link>

        {groups?.map((group) => (
          <div key={group.id} className="category-group">
            <Link to={`/categories/groups/${group.id}/edit`} className="category-group__title">
              <h3>
                <FolderOpen size={16} /> {group.name}
              </h3>
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
                  <Plus size={16} /> Add category
                </Link>
              </li>
            </ul>
          </div>
        ))}

        {groups?.length === 0 && (
          <div className="empty-state">
            <Tags size={40} strokeWidth={1.5} />
            <h2>No category groups yet</h2>
            <p>
              Groups like "Bills" or "Fun" organize the categories you'll assign your budget to —
              e.g. "Bills" → "Electricity".
            </p>
          </div>
        )}
      </div>
      <Link to="/categories/groups/new" className="fab" aria-label="Add category group">
        <Plus size={26} />
      </Link>
    </div>
  )
}
