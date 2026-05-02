import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import styles from '../admin.module.css';

type OrderItem = {
  id: string;
  quantity: number;
  price: number | null;
  title: string;
  product: {
    id: string | null;
    slug: string | null;
    images: { url: string }[];
  };
};

type Order = {
  id: string;
  ticket_number: string;
  status: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  comment: string | null;
  total_items: number;
  total_price: number | null;
  created_at: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В работе' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatPrice(value: number | null) {
  if (typeof value !== 'number') {
    return 'Цена по запросу';
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClass(status: string) {
  if (status === 'new') return styles.statusNew;
  if (status === 'processing') return styles.statusProcessing;
  if (status === 'completed') return styles.statusCompleted;
  return styles.statusCancelled;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => apiRequest<Order[]>('/api/admin/orders'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) =>
      apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-orders-summary'] }),
      ]);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Продажи</p>
          <h1 className={styles.title}>Заказы</h1>
          <p className={styles.subtitle}>
            Здесь появляются тикеты, которые покупатели оформляют из корзины.
          </p>
        </div>
      </div>

      {ordersQuery.isLoading ? <div className={styles.inlineNotice}>Загрузка заказов...</div> : null}
      {ordersQuery.isError ? <div className={styles.errorNotice}>Не удалось загрузить заказы.</div> : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && ordersQuery.data?.length === 0 ? (
        <div className={styles.emptyState}>Заказов пока нет.</div>
      ) : null}

      <div className={styles.formStack}>
        {ordersQuery.data?.map((order) => (
          <article key={order.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>{order.ticket_number}</h2>
                <p className={styles.cardText}>
                  {formatDate(order.created_at)} · {order.customer_name || 'Без имени'}
                </p>
              </div>

              <div className={styles.toolbarGroup}>
                <span className={statusClass(order.status)}>
                  {STATUS_OPTIONS.find((option) => option.value === order.status)?.label || order.status}
                </span>
                <select
                  className={styles.select}
                  value={order.status}
                  onChange={(event) => updateStatus.mutate({ orderId: order.id, status: event.target.value })}
                  disabled={updateStatus.isPending}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.cardGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Покупатель</div>
                <div className={styles.tablePrimary}>{order.customer_email}</div>
                <div className={styles.statMeta}>{order.customer_phone || 'Телефон не указан'}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>Позиции</div>
                <div className={styles.statValue}>{order.total_items}</div>
                <div className={styles.statMeta}>Сумма: {formatPrice(order.total_price)}</div>
              </div>
            </div>

            {order.comment ? <div className={styles.inlineNotice}>Комментарий: {order.comment}</div> : null}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Количество</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
