import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import styles from './admin.module.css'

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

  const links = [
    { to: '/admin', label: 'Дашборд', description: 'Краткая сводка по магазину', end: true },
    { to: '/admin/orders', label: 'Заказы', description: 'Оформления из корзины' },
    { to: '/admin/requests', label: 'Заявки', description: 'Сообщения из формы контактов' },
    { to: '/admin/categories', label: 'Категории', description: 'Структура каталога' },
    { to: '/admin/products', label: 'Товары', description: 'Карточки и публикация' },
    { to: '/admin/reviews', label: 'Отзывы', description: 'Отзывы, фото и порядок' },
    { to: '/admin/works', label: 'Наши работы', description: 'Портфолио и Instagram' },
    { to: '/admin/import', label: 'Импорт Excel', description: 'Массовая загрузка из файла' },
    { to: '/admin/media-import', label: 'Фото', description: 'Автопарсинг из сайтов' },
  ]

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandLabel}>Admin</span>
          <h1 className={styles.brandTitle}>МебельКомплект. Панель</h1>
          <p className={styles.brandText}>
            Управление каталогом, заказами, заявками, отзывами и публикацией контента на сайте.
          </p>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
              }
            >
              <span className={styles.navTitle}>{link.label}</span>
              <span className={styles.navSubtitle}>{link.description}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userMeta}>
              <span className={styles.userLabel}>Текущий пользователь</span>
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
