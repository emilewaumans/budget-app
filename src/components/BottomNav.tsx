import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/budget', label: 'Budget' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/categories', label: 'Categories' },
]

export function MainLayout() {
  return (
    <>
      <Outlet />
      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
