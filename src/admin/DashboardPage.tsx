import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiRequest } from '@/lib/api'
import styles from './admin.module.css'

type Order = {
  id: string
  status: string
}

export default function DashboardPage() {
  const ordersQuery = useQuery({
    queryKey: ['admin-orders-summary'],
    queryFn: async () => apiRequest<Order[]>('/api/admin/orders'),
  })

  const totalOrders = ordersQuery.data?.length ?? 0
  const newOrders = ordersQuery.data?.filter((order) => order.status === 'new').length ?? 0
  const activeOrders = ordersQuery.data?.filter((order) => order.status === 'processing').length ?? 0

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Панель магазина</p>
          <h1 className={styles.title}>Админка без хаоса</h1>
          <p className={styles.subtitle}>
            Здесь видно общую картину по заказам и есть быстрый переход к управлению каталогом.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/products/new" className={styles.buttonPrimary}>Добавить товар</Link>
          <Link to="/admin/orders" className={styles.buttonSecondary}>Открыть заказы</Link>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Всего заказов</div>
          <div className={styles.statValue}>{totalOrders}</div>
          <div className={styles.statMeta}>Все заявки, собранные из корзины покупателей.</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Новые</div>
          <div className={styles.statValue}>{newOrders}</div>
          <div className={styles.statMeta}>Требуют проверки и первого контакта.</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>В работе</div>
          <div className={styles.statValue}>{activeOrders}</div>
          <div className={styles.statMeta}>Заказы, которые уже обрабатываются.</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Быстрые действия</h2>
            <p className={styles.cardText}>Частые операции без лишних переходов.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/products/new" className={styles.buttonPrimary}>Новый товар</Link>
          <Link to="/admin/products" className={styles.buttonSecondary}>Список товаров</Link>
          <Link to="/admin/categories" className={styles.buttonSecondary}>Категории</Link>
          <Link to="/admin/import" className={styles.buttonGhost}>Импорт Excel</Link>
        </div>
      </div>
    </div>
  )
}
