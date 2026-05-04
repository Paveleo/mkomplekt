import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiRequest } from '@/lib/api'
import { arrayMove } from '../../utils/arrayMove'
import styles from '../admin.module.css'

type AdminProduct = {
  id: string
  title: string
  slug: string
  sku?: string | null
  is_published: boolean
  category_id: string
  category_title: string
  sort: number
}

type CategoryOption = {
  id: string
  title: string
}

export default function ProductsPage() {
  const qc = useQueryClient()
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [imageFilter, setImageFilter] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<AdminProduct[]>([])

  const catsQ = useQuery({
    queryKey: ['categories-for-products'],
    queryFn: async () => apiRequest<CategoryOption[]>('/api/admin/categories/options'),
  })

  const q = useQuery({
    queryKey: ['products-admin', catFilter, statusFilter, imageFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (catFilter) {
        params.set('category_id', catFilter)
      }
      if (statusFilter) {
        params.set('is_published', statusFilter)
      }
      if (imageFilter) {
        params.set('has_image', imageFilter)
      }
      if (search.trim()) {
        params.set('search', search.trim())
      }
      const suffix = params.toString() ? `?${params.toString()}` : ''
      return apiRequest<AdminProduct[]>(`/api/admin/products${suffix}`)
    },
  })

  useEffect(() => {
    if (q.data) {
      setRows(q.data)
    }
  }, [q.data])

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) return
    if (!catFilter && rows[targetIndex].category_id !== rows[index].category_id) return
    setRows(arrayMove(rows, index, targetIndex))
  }

  const saveOrder = async () => {
    const pairs: { id: string; sort: number }[] = []

    if (catFilter) {
      rows.forEach((row, index) => pairs.push({ id: row.id, sort: index }))
    } else {
      const counters = new Map<string, number>()
      for (const row of rows) {
        const next = counters.get(row.category_id) ?? 0
        pairs.push({ id: row.id, sort: next })
        counters.set(row.category_id, next + 1)
      }
    }

    try {
      await apiRequest('/api/admin/products/order', {
        method: 'PUT',
        body: JSON.stringify(pairs),
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products-admin'] }),
        qc.invalidateQueries({ queryKey: ['products'] }),
      ])
      alert('Порядок товаров сохранён')
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить порядок')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return

    try {
      await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' })
      await qc.invalidateQueries({ queryKey: ['products-admin'] })
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить товар')
    }
  }

  const publishedCount = useMemo(
    () => rows.filter((row) => row.is_published).length,
    [rows],
  )
  const isReorderLocked =
    search.trim().length > 0 || statusFilter.length > 0 || imageFilter.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Каталог</p>
          <h1 className={styles.title}>Товары</h1>
          <p className={styles.subtitle}>
            Фильтруйте каталог по категории, статусу и наличию фото, ищите по совпадениям
            в названии, slug, SKU и названии раздела.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/products/new" className={styles.buttonPrimary}>Новый товар</Link>
          <button className={styles.buttonSecondary} onClick={saveOrder} disabled={isReorderLocked}>
            Сохранить порядок
          </button>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Найдено</div>
          <div className={styles.statValue}>{rows.length}</div>
          <div className={styles.statMeta}>Товары в текущей выборке.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Опубликованы</div>
          <div className={styles.statValue}>{publishedCount}</div>
          <div className={styles.statMeta}>Видны посетителям сайта.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Скрыты</div>
          <div className={styles.statValue}>{rows.length - publishedCount}</div>
          <div className={styles.statMeta}>Черновики и выключенные карточки.</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <input
              className={styles.input}
              placeholder="Поиск: название, slug, SKU, категория"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={catFilter}
              onChange={(event) => setCatFilter(event.target.value)}
            >
              <option value="">Все категории</option>
              {catsQ.data?.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Любой статус</option>
              <option value="true">Опубликованные</option>
              <option value="false">Скрытые</option>
            </select>
            <select
              className={styles.select}
              value={imageFilter}
              onChange={(event) => setImageFilter(event.target.value)}
            >
              <option value="">Любые изображения</option>
              <option value="false">Без изображения</option>
              <option value="true">С изображением</option>
            </select>
          </div>

          <div className={styles.toolbarGroup}>
            <Link to="/admin/import" className={styles.buttonGhost}>Импорт Excel</Link>
          </div>
        </div>
      </div>

      {q.isLoading ? <div className={styles.inlineNotice}>Загрузка товаров...</div> : null}
      {q.isError ? <div className={styles.errorNotice}>Не удалось загрузить список товаров.</div> : null}

      {!q.isLoading && !q.isError && rows.length === 0 ? (
        <div className={styles.emptyState}>По текущему фильтру товаров не найдено.</div>
      ) : null}

      {!q.isLoading && !q.isError && rows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Товар</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Порядок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className={styles.tableTitle}>
                      <span className={styles.tablePrimary}>{product.title}</span>
                      <span className={styles.tableSecondary}>
                        /{product.slug}{product.sku ? ` • SKU: ${product.sku}` : ''}
                      </span>
                    </div>
                  </td>
                  <td>{product.category_title || 'Без категории'}</td>
                  <td>
                    <span className={product.is_published ? styles.statusCompleted : styles.statusCancelled}>
                      {product.is_published ? 'Опубликован' : 'Скрыт'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.toolbarGroup}>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || isReorderLocked}
                      >
                        ↑
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, +1)}
                        disabled={index === rows.length - 1 || isReorderLocked}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <Link to={`/admin/products/${product.id}`} className={styles.buttonSecondary}>Редактировать</Link>
                      <button className={styles.buttonDanger} onClick={() => handleDelete(product.id)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {isReorderLocked ? (
        <div className={styles.inlineNotice}>
          Перестановка временно отключена, пока включён поиск или один из фильтров.
          Очистите их, чтобы менять порядок товаров.
        </div>
      ) : null}
    </div>
  )
}
