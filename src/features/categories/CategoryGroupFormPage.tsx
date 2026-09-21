import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function CategoryGroupFormPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(groupId)
  const [name, setName] = useState('')

  const categoryCount = useLiveQuery(
    () => (groupId ? db.categories.where('groupId').equals(groupId).count() : 0),
    [groupId],
  )

  useEffect(() => {
    if (!groupId) return
    db.categoryGroups.get(groupId).then((group) => {
      if (group) setName(group.name)
    })
  }, [groupId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing && groupId) {
      await db.categoryGroups.update(groupId, { name: name.trim() })
    } else {
      const count = await db.categoryGroups.count()
      await db.categoryGroups.add({ id: crypto.randomUUID(), name: name.trim(), sortOrder: count })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!groupId) return
    await db.categoryGroups.delete(groupId)
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit group' : 'New group'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bills"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing &&
          (categoryCount === 0 ? (
            <button type="button" className="btn btn-danger btn-block" onClick={handleDelete}>
              Delete group
            </button>
          ) : (
            <p className="list-empty">Move or delete its categories first to remove this group.</p>
          ))}
      </form>
    </div>
  )
}
