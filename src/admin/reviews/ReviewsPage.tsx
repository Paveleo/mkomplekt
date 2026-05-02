import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiRequest } from '@/lib/api'
import { arrayMove } from '@/utils/arrayMove'
import styles from '../admin.module.css'

type AdminReview = {
  id: string
  name: string
  city?: string | null
  role?: string | null
  body: string
  avatar_url?: string | null
  image_url?: string | null
  is_published: boolean
  sort: number
}

export default function ReviewsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<AdminReview[]>([])

  const query = useQuery({
    queryKey: ['reviews-admin'],
    queryFn: async () => apiRequest<AdminReview[]>('/api/admin/reviews'),
  })

  useEffect(() => {
    if (query.data) {
      setRows(query.data)
    }
  }, [query.data])

  const filteredRows = rows.filter((row) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [row.name, row.city || '', row.role || '', row.body].some((value) =>
      value.toLowerCase().includes(q),
    )
  })

  const isReorderLocked = search.trim().length > 0

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) return
    setRows(arrayMove(rows, index, targetIndex))
  }

  const saveOrder = async () => {
    try {
      await apiRequest('/api/admin/reviews/order', {
        method: 'PUT',
        body: JSON.stringify(rows.map((row, index) => ({ id: row.id, sort: index }))),
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['reviews-admin'] }),
        qc.invalidateQueries({ queryKey: ['reviews'] }),
      ])
      alert('Порядок отзывов сохранён.')
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить порядок отзывов.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return

    try {
      await apiRequest(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['reviews-admin'] }),
        qc.invalidateQueries({ queryKey: ['reviews'] }),
      ])
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить отзыв.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Отзывы</p>
          <h1 className={styles.title}>Управление отзывами</h1>
          <p className={styles.subtitle}>
            Здесь можно добавлять новые отзывы, редактировать тексты, фотографии и
            порядок показа на главной странице.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/reviews/new" className={styles.buttonPrimary}>
            Добавить отзыв
          </Link>
          <button className={styles.buttonSecondary} onClick={saveOrder}>
            Сохранить порядок
          </button>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Всего отзывов</div>
          <div className={styles.statValue}>{rows.length}</div>
          <div className={styles.statMeta}>Карточки, доступные в админке.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Опубликованы</div>
          <div className={styles.statValue}>{rows.filter((row) => row.is_published).length}</div>
          <div className={styles.statMeta}>Сейчас видны на сайте.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Скрыты</div>
          <div className={styles.statValue}>{rows.filter((row) => !row.is_published).length}</div>
          <div className={styles.statMeta}>Можно доработать и включить позже.</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <input
              className={styles.input}
              placeholder="Поиск по имени, городу или тексту"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      {query.isLoading ? <div className={styles.inlineNotice}>Загрузка отзывов...</div> : null}
      {query.isError ? <div className={styles.errorNotice}>Не удалось загрузить отзывы.</div> : null}

      {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
        <div className={styles.emptyState}>По текущему фильтру отзывы не найдены.</div>
      ) : null}

      {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Автор</th>
                <th>Статус</th>
                <th>Порядок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((review, index) => {
                const rowIndex = rows.findIndex((row) => row.id === review.id)

                return (
                  <tr key={review.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.tableTitle}>
                        <span className={styles.tablePrimary}>{review.name}</span>
                        <span className={styles.tableSecondary}>
                          {[review.role || 'Клиент', review.city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={review.is_published ? styles.statusCompleted : styles.statusCancelled}>
                        {review.is_published ? 'Опубликован' : 'Скрыт'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.toolbarGroup}>
                        <button
                          className={styles.iconButton}
                          onClick={() => move(rowIndex, -1)}
                          disabled={rowIndex === 0 || isReorderLocked}
                        >
                          ↑
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={() => move(rowIndex, 1)}
                          disabled={rowIndex === rows.length - 1 || isReorderLocked}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <Link to={`/admin/reviews/${review.id}`} className={styles.buttonSecondary}>
                          Редактировать
                        </Link>
                        <button className={styles.buttonDanger} onClick={() => handleDelete(review.id)}>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {isReorderLocked ? (
        <div className={styles.inlineNotice}>
          Пока включён поиск, перестановка отзывов отключена. Очистите строку поиска,
          чтобы менять порядок.
        </div>
      ) : null}
    </div>
  )
}
