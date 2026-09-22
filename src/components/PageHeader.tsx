import { ChevronLeft, HelpCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  back?: boolean
  /** Shows a help icon linking to that topic's explanation on the Help page. */
  helpTopic?: string
}

export function PageHeader({ title, back = false, helpTopic }: PageHeaderProps) {
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
          <ChevronLeft size={24} />
        </button>
      )}
      <h1>{title}</h1>
      {helpTopic && (
        <Link
          to={`/help?topic=${helpTopic}`}
          className="page-header__help"
          aria-label="How this page works"
        >
          <HelpCircle size={22} />
        </Link>
      )}
    </header>
  )
}
