import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function CategoryGroupFormPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(groupId)
  const [name, setName] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const categoryIds = useLiveQuery(
    () => (groupId ? db.categories.where('groupId').equals(groupId).primaryKeys() : []),
    [groupId],
  )

  const affectedTransactionCount = useLiveQuery(async () => {
    if (!categoryIds || categoryIds.length === 0) return 0
    const splits = await db.splits.where('categoryId').anyOf(categoryIds).toArray()
    return new Set(splits.map((s) => s.transactionId)).size
  }, [categoryIds])

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
    if (!groupId || !categoryIds) return
    await db.splits.where('categoryId').anyOf(categoryIds).delete()
    await db.categoryMonths.where('categoryId').anyOf(categoryIds).delete()
    await db.goals.where('categoryId').anyOf(categoryIds).delete()
    await db.categories.where('groupId').equals(groupId).delete()
    await db.categoryGroups.delete(groupId)
    navigate('/categories')
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

        {isEditing && !confirmingDelete && (
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 size={18} /> Delete group
          </button>
        )}

        {isEditing && confirmingDelete && (
          <div className="confirm-box">
            <p>
              Delete this group and its {categoryIds?.length ?? 0} categor
              {categoryIds?.length === 1 ? 'y' : 'ies'}?
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
