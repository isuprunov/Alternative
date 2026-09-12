import { useEffect, useState, type ComponentType } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarIcon,
  CloseIcon,
  HomeIcon,
  MenuIcon,
  NewsIcon,
  ResourcesIcon,
  ServiceIcon,
  SettingsIcon,
} from './icons'
import { useData } from '../data/store'
import './Layout.css'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number }>
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Главная', icon: HomeIcon, end: true },
  { to: '/schedule', label: 'Расписание', icon: CalendarIcon },
  { to: '/services', label: 'Служения', icon: ServiceIcon },
  { to: '/news', label: 'Новости', icon: NewsIcon },
  { to: '/resources', label: 'Ресурсы', icon: ResourcesIcon },
]

export default function Layout() {
  const { data } = useData()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Закрываем мобильное меню при переходе между разделами.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Блокируем прокрутку тела при открытом меню.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="app">
      <Sidebar
        communityName={data.settings.name}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {menuOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <MenuIcon size={24} />
          </button>
          <div className="topbar__title">
            <img className="topbar__logo" src="/favicon.svg" alt="" />
            <span>{data.settings.name}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Sidebar({
  communityName,
  open,
  onClose,
}: {
  communityName: string
  open: boolean
  onClose: () => void
}) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar__brand">
        <img className="sidebar__logo" src="/favicon.svg" alt="" />
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">{communityName}</span>
          <span className="sidebar__brand-sub">Информационный центр</span>
        </div>
        <button
          className="icon-btn sidebar__close"
          onClick={onClose}
          aria-label="Закрыть меню"
        >
          <CloseIcon size={22} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <NavLink
          to="/admin"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <SettingsIcon size={20} />
          <span>Админка</span>
        </NavLink>
      </div>
    </aside>
  )
}
