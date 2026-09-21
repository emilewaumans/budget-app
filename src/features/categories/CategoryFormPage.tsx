import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function CategoryFormPage() {
  const { groupId: groupIdFromRoute, categoryId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(categoryId)

  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState(groupIdFromRoute ?? '')

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])

  useEffect(() => {
    if (!categoryId) return
    db.categories.get(categoryId).then((category) => {
      if (!category) return
      setName(category.name)
      setGroupId(category.groupId)
    })
  }, [categoryId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !groupId) return

    if (isEditing && categoryId) {
      await db.categories.update(categoryId, { name: name.trim(), groupId })
    } else {
      const count = await db.categories.where('groupId').equals(groupId).count()
      await db.categories.add({ id: crypto.randomUUID(), name: name.trim(), groupId, sortOrder: count })
    }
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit category' : 'New category'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electricity"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="group">Group</label>
          <select id="group" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
            <option value="" disabled>
              Choose a group
            </option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>
      </form>
    </div>
  )
}
