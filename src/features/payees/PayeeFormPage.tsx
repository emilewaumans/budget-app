import { Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { db } from '../../db/db'

export default function PayeeFormPage() {
  const { payeeId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(payeeId)

  const [name, setName] = useState('')

  useEffect(() => {
    if (!isEditing) return
    db.payees.get(payeeId!).then((payee) => {
      if (payee) setName(payee.name)
    })
  }, [isEditing, payeeId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    if (isEditing && payeeId) {
      await db.payees.update(payeeId, { name: trimmed })
    } else {
      await db.payees.add({ id: crypto.randomUUID(), name: trimmed })
    }

    navigate(-1)
  }

  async function handleDelete() {
    if (!payeeId) return
    await db.payees.delete(payeeId)
    navigate(-1)
  }

  return (
    <div className="page">
      <PageHeader title={isEditing ? 'Edit payee' : 'New payee'} back />
      <form className="page-body" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Colruyt"
            autoFocus
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save
        </button>

        {isEditing && (
          <button type="button" className="btn btn-danger btn-block" onClick={handleDelete}>
            <Trash2 size={18} /> Delete payee
          </button>
        )}
      </form>
    </div>
  )
}
