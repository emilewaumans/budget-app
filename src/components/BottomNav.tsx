import { BarChart3, Landmark, Settings, Tags, Wallet } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/budget', label: 'Budget', Icon: Wallet },
  { to: '/accounts', label: 'Accounts', Icon: Landmark },
  { to: '/reports', label: 'Reports', Icon: BarChart3 },
  { to: '/categories', label: 'Categories', Icon: Tags },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export function MainLayout() {
  return (
    <>
      <Outlet />
      <nav className="bottom-nav">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <Icon size={22} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
