import { HelpCircle, PiggyBank, Repeat, Settings, Tags } from 'lucide-react'
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
            <Link className="list-item" to="/help">
              <span className="list-item__icon">
                <HelpCircle size={20} />
              </span>
              <span className="list-item__text">
                <div className="list-item__title">How this app works</div>
                <div className="list-item__subtitle">A simple guide to every feature</div>
              </span>
            </Link>
          </li>
          <li>
            <Link className="list-item" to="/goals">
              <span className="list-item__icon">
                <PiggyBank size={20} />
              </span>
              <span className="list-item__text">
                <div className="list-item__title">Savings Goals</div>
                <div className="list-item__subtitle">Set money aside for something you want</div>
              </span>
            </Link>
          </li>
          <li>
            <Link className="list-item" to="/recurring">
              <span className="list-item__icon">
                <Repeat size={20} />
              </span>
              <span className="list-item__text">
                <div className="list-item__title">Recurring</div>
                <div className="list-item__subtitle">Salary, subscriptions, and other repeats</div>
              </span>
            </Link>
          </li>
          <li>
            <Link className="list-item" to="/categories">
              <span className="list-item__icon">
                <Tags size={20} />
              </span>
              <span className="list-item__text">
                <div className="list-item__title">Categories</div>
                <div className="list-item__subtitle">Groups, categories, and rules for spending</div>
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
