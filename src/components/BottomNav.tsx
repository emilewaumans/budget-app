import { Home as HomeIcon, MoreHorizontal, PiggyBank } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/goals', label: 'Savings Goals', Icon: PiggyBank },
  { to: '/more', label: 'More', Icon: MoreHorizontal },
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
