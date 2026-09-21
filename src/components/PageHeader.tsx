import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  back?: boolean
}

export function PageHeader({ title, back = false }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="page-header">
      {back && (
        <button
          type="button"
          className="page-header__back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          ←
        </button>
      )}
      <h1>{title}</h1>
    </header>
  )
}
