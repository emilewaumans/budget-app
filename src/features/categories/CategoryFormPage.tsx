import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2 } from 'lucide-react'
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
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])

  const affectedTransactionCount = useLiveQuery(async () => {
    if (!categoryId) return 0
    const splits = await db.splits.where('categoryId').equals(categoryId).toArray()
    return new Set(splits.map((s) => s.transactionId)).size
  }, [categoryId])

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
      await db.categories.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        groupId,
        sortOrder: count,
      })
    }

    navigate(-1)
  }

  async function handleDelete() {
    if (!categoryId) return
    await db.splits.where('categoryId').equals(categoryId).delete()
    await db.categoryMonths.where('categoryId').equals(categoryId).delete()
    await db.categories.delete(categoryId)
    navigate('/categories')
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

        {isEditing && !confirmingDelete && (
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 size={18} /> Delete category
          </button>
        )}

        {isEditing && confirmingDelete && (
          <div className="confirm-box">
            <p>
              Delete this category?
              {affectedTransactionCount
                ? ` ${affectedTransactionCount} transaction${affectedTransactionCount === 1 ? '' : 's'} will become uncategorized.`
                : ''}{' '}
              This can't be undone.
            </p>
            <div className="confirm-box__actions">
              <button type="button" className="btn" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete permanently
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
