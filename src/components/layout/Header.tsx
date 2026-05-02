import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { useCartCount } from '@/hooks/useCart'
import s from './Header.module.css'

const navItems = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/about', label: 'О нас' },
  { to: '/contacts', label: 'Контакты' },
]

const reviewUrl =
  import.meta.env.VITE_2GIS_REVIEWS_URL || 'https://2gis.ru/yakutsk/firm/7037402698862520/tab/reviews'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { data: cartCount = 0 } = useCartCount()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className={`${s.header} ${open ? s.open : ''}`}>
      <div className={s.shell}>
        <div className={s.panel}>
          <div className={s.row}>
            <Link className={s.logo} to="/">
              МебельКомплект.
            </Link>

            <nav className={s.nav}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `${s.navLink} ${isActive ? s.navLinkActive : ''}`.trim()}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={s.actions}>
              <Link to="/cart" className={s.actionLink}>
                <span>Корзина</span>
                <span className={s.badge}>{cartCount}</span>
              </Link>

              <Link to={user ? '/account' : '/auth?mode=login&redirect=%2Faccount'} className={s.actionLink}>
                {user ? 'Кабинет' : 'Войти'}
              </Link>

              <a href={reviewUrl} target="_blank" rel="noreferrer" className={s.actionPrimary}>
                Оставить отзыв
              </a>
            </div>

            <button
              type="button"
              className={s.burger}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <div className={s.mobileMenu}>
        <div className={s.mobilePanel}>
          <div className={s.mobileNav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${s.mobileNavLink} ${isActive ? s.mobileNavLinkActive : ''}`.trim()
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className={s.mobileActions}>
            <Link to="/cart" className={s.actionLink}>
              <span>Корзина</span>
              <span className={s.badge}>{cartCount}</span>
            </Link>

            <Link to={user ? '/account' : '/auth?mode=login&redirect=%2Faccount'} className={s.actionLink}>
              {user ? 'Кабинет' : 'Войти'}
            </Link>

            <a href={reviewUrl} target="_blank" rel="noreferrer" className={s.actionPrimary}>
              Оставить отзыв
            </a>
          </div>
        </div>
      </div>

      <button type="button" className={s.scrim} aria-label="Закрыть меню" onClick={() => setOpen(false)} />
    </header>
  )
}
