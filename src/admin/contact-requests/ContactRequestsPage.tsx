import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import styles from '../admin.module.css'

type ContactRequest = {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  attachment_url: string | null
  status: string
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Новая' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Закрыта' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusClass(status: string) {
  if (status === 'new') return styles.statusNew
  if (status === 'in_progress') return styles.statusProcessing
  return styles.statusCompleted
}

export default function ContactRequestsPage() {
  const queryClient = useQueryClient()

  const requestsQuery = useQuery({
    queryKey: ['admin-contact-requests'],
    queryFn: async () => apiRequest<ContactRequest[]>('/api/admin/contact-requests'),
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/admin/contact-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-contact-requests'] })
    },
  })

  const removeRequest = useMutation({
    mutationFn: async (id: string) =>
      apiRequest(`/api/admin/contact-requests/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-contact-requests'] })
    },
  })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Коммуникации</p>
          <h1 className={styles.title}>Заявки с сайта</h1>
          <p className={styles.subtitle}>
            Здесь появляются обращения из формы «Свяжитесь с нами». Менеджер может менять
            статус, открыть приложенную фотографию и удалить обработанную заявку.
          </p>
        </div>
      </div>

      {requestsQuery.isLoading ? <div className={styles.inlineNotice}>Загружаем заявки...</div> : null}
      {requestsQuery.isError ? <div className={styles.errorNotice}>Не удалось загрузить заявки.</div> : null}

      {!requestsQuery.isLoading && !requestsQuery.isError && requestsQuery.data?.length === 0 ? (
        <div className={styles.emptyState}>Новых заявок пока нет.</div>
      ) : null}

      <div className={styles.formStack}>
        {requestsQuery.data?.map((request) => (
          <article key={request.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>{request.name}</h2>
                <p className={styles.cardText}>Получена {formatDate(request.created_at)}</p>
              </div>

              <div className={styles.toolbarGroup}>
                <span className={statusClass(request.status)}>
                  {STATUS_OPTIONS.find((option) => option.value === request.status)?.label || request.status}
                </span>
                <select
                  className={styles.select}
                  value={request.status}
                  onChange={(event) => updateStatus.mutate({ id: request.id, status: event.target.value })}
                  disabled={updateStatus.isPending}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.buttonDanger}
                  onClick={() => removeRequest.mutate(request.id)}
                  disabled={removeRequest.isPending}
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className={styles.cardGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Телефон</div>
                <div className={styles.tablePrimary}>{request.phone || 'Не указан'}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>Email</div>
                <div className={styles.tablePrimary}>{request.email || 'Не указан'}</div>
              </div>
            </div>

            <div className={styles.inlineNotice}>
              {request.message || 'Клиент отправил заявку без комментария.'}
            </div>

            {request.attachment_url ? (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Фотография из заявки</h3>
                <p className={styles.sectionDescription}>
                  Менеджер может открыть изображение в новой вкладке или посмотреть его прямо здесь.
                </p>

                <div className={styles.previewGrid}>
                  <div className={styles.previewCard}>
                    <img className={styles.previewImage} src={request.attachment_url} alt={request.name} />
                    <div className={styles.previewInfo}>Прикреплённое фото</div>
                    <div style={{ padding: '0 12px 12px' }}>
                      <a
                        href={request.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.buttonSecondary}
                      >
                        Открыть оригинал
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
