import type { ComponentType, SVGProps } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import {
  CatalogIcon,
  DashboardIcon,
  FolderIcon,
  ImportIcon,
  LogoutIcon,
  OrdersIcon,
  RequestIcon,
  ReviewIcon,
  WorksIcon,
} from './AdminIcons'
import styles from './admin.module.css'

type AdminNavLink = {
  to: string
  label: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

const links: AdminNavLink[] = [
  { to: '/admin', label: 'Дашборд', description: 'Краткая сводка', icon: DashboardIcon, end: true },
  { to: '/admin/orders', label: 'Заказы', description: 'Оформления из корзины', icon: OrdersIcon },
  { to: '/admin/requests', label: 'Заявки', description: 'Сообщения клиентов', icon: RequestIcon },
  { to: '/admin/categories', label: 'Категории', description: 'Структура каталога', icon: FolderIcon },
  { to: '/admin/products', label: 'Товары', description: 'Карточки и цены', icon: CatalogIcon },
  { to: '/admin/reviews', label: 'Отзывы', description: 'Отзывы и порядок', icon: ReviewIcon },
  { to: '/admin/works', label: 'Наши работы', description: 'Портфолио', icon: WorksIcon },
  { to: '/admin/import', label: 'Импорт Excel', description: 'Массовая загрузка', icon: ImportIcon },
]

export default function AdminLayout() {
  const { loading, user, signOut } = useAuth()

  if (loading) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <p className={styles.eyebrow}>Admin access</p>
          <h1 className={styles.title}>Проверяем доступ</h1>
          <p className={styles.subtitle}>
            Загружаем сессию администратора и подключаем панель управления.
          </p>
        </div>
      </div>
    )
  }

  if (!user?.is_admin) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <span className={styles.brandMark}>МК</span>
            <span className={styles.brandLabel}>Admin</span>
          </div>
          <h1 className={styles.brandTitle}>МебельКомплект</h1>
          <p className={styles.brandText}>Каталог, заказы, заявки, отзывы и контент сайта.</p>
        </div>

        <nav className={styles.nav} aria-label="Разделы админки">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
                }
              >
                <span className={styles.navIcon}>
                  <Icon className={styles.iconSvg} />
                </span>
                <span className={styles.navCopy}>
                  <span className={styles.navTitle}>{link.label}</span>
                  <span className={styles.navSubtitle}>{link.description}</span>
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{(user.full_name || user.email || 'A').charAt(0).toUpperCase()}</div>
            <div className={styles.userMeta}>
              <span className={styles.userLabel}>Администратор</span>
              <span className={styles.userValue}>{user.full_name || user.email}</span>
            </div>
          </div>

          <button
            className={styles.buttonGhost}
            onClick={async () => {
              await signOut()
              location.href = '/admin/login'
            }}
          >
            <LogoutIcon className={styles.buttonIcon} />
            Выйти
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
