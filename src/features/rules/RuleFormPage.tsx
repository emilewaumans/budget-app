import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'
import type { RuleMatchType } from '../../db/types'

export default function RuleFormPage() {
  const { ruleId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(ruleId)

  const [matchText, setMatchText] = useState('')
  const [matchType, setMatchType] = useState<RuleMatchType>('contains')
  const [categoryId, setCategoryId] = useState('')

  const groups = useLiveQuery(() => db.categoryGroups.orderBy('sortOrder').toArray(), [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])

  useEffect(() => {
    if (!ruleId) return
    db.rules.get(ruleId).then((rule) => {
      if (!rule) return
      setMatchText(rule.matchText)
      setMatchType(rule.matchType)
      setCategoryId(rule.categoryId)
    })
  }, [ruleId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!matchText.trim() || !categoryId) return

    if (isEditing && ruleId) {
      await db.rules.update(ruleId, { matchText: matchText.trim(), matchType, categoryId })
    } else {
      const count = await db.rules.count()
      await db.rules.add({
        id: crypto.randomUUID(),
        matchText: matchText.trim(),
        matchType,
        categoryId,
        priority: count,
      })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!ruleId) return
    await db.rules.delete(ruleId)
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit rule' : 'New rule'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="matchText">Payee text</label>
          <input
            id="matchText"
            value={matchText}
            onChange={(e) => setMatchText(e.target.value)}
            placeholder="e.g. Colruyt"
            required
          />
        </div>

        <div className="segmented">
          <button
            type="button"
            className={matchType === 'contains' ? 'active' : undefined}
            onClick={() => setMatchType('contains')}
          >
            Contains
          </button>
          <button
            type="button"
            className={matchType === 'exact' ? 'active' : undefined}
            onClick={() => setMatchType('exact')}
          >
            Exactly matches
          </button>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose a category
            </option>
            {groups?.map((group) => (
              <optgroup key={group.id} label={group.name}>
                {categories
                  ?.filter((c) => c.groupId === group.id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && (
          <button type="button" className="btn btn-danger btn-block" onClick={handleDelete}>
            Delete rule
          </button>
        )}
      </form>
    </div>
  )
}
