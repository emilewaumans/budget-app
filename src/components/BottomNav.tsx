import { BarChart3, Home as HomeIcon, Landmark, MoreHorizontal, Wallet } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/budget', label: 'Budget', Icon: Wallet },
  { to: '/accounts', label: 'Accounts', Icon: Landmark },
  { to: '/reports', label: 'Reports', Icon: BarChart3 },
]

const MORE_PATHS = ['/more', '/categories', '/settings', '/goals']

export function MainLayout() {
  const location = useLocation()
  const isMoreActive = MORE_PATHS.some((p) => location.pathname.startsWith(p))

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
        <NavLink to="/more" className={isMoreActive ? 'active' : undefined}>
          <MoreHorizontal size={22} strokeWidth={2} />
          <span>More</span>
        </NavLink>
      </nav>
    </>
  )
}
