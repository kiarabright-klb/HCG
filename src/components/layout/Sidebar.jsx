import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Globe, Map, Briefcase, Wallet, Compass
} from 'lucide-react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/destinations', icon: Globe, label: 'Destinations' },
  { to: '/map', icon: Map, label: 'World Map' },
  { to: '/trips', icon: Briefcase, label: 'Trips' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Compass size={18} color="#60a5fa" />
          <h1>Wanderlog</h1>
        </div>
        <p>Personal Travel Planner</p>
      </div>

      <nav className="sidebar-nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Your world, mapped.</span>
      </div>
    </aside>
  )
}
