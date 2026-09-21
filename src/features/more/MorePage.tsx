import { Settings, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MorePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>More</h1>
      </header>
      <div className="page-body">
        <ul className="list">
          <li>
            <Link className="list-item" to="/categories">
              <span className="list-item__icon">
                <Tags size={20} />
              </span>
              <span className="list-item__text">
                <div className="list-item__title">Categories</div>
                <div className="list-item__subtitle">Groups, categories, and rules</div>
              </span>
            </Link>
          </li>
          <li>
            <Link className="list-item" to="/settings">
              <span className="list-item__icon">
                <Settings size={20} />
              </span>
              <span className="list-item__text">
                <div className="list-item__title">Settings</div>
                <div className="list-item__subtitle">App lock and data export</div>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
