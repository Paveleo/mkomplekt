import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import CategoryForm from './CategoryForm'
import { arrayMove } from '../../utils/arrayMove'
import styles from '../admin.module.css'

type Row = {
  id: string
  title: string
  slug: string | null
  parent_id: string | null
  sort: number | null
  image_url?: string | null
}

type CategoryOption = {
  id: string
  title: string
}

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Row | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [parentFilter, setParentFilter] = useState('')

  const optionsQ = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => apiRequest<CategoryOption[]>('/api/admin/categories/options'),
  })

  const q = useQuery({
    queryKey: ['categories', search, parentFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.trim()) {
        params.set('search', search.trim())
      }
      if (parentFilter) {
        params.set('parent_id', parentFilter)
      }
      const suffix = params.toString() ? `?${params.toString()}` : ''
      return apiRequest<Row[]>(`/api/admin/categories${suffix}`)
    },
  })

  useEffect(() => {
    if (q.data) {
      setRows(q.data)
    }
  }, [q.data])

  const titleMap = useMemo(
    () => new Map((optionsQ.data || []).map((row) => [row.id, row.title])),
    [optionsQ.data],
  )

  const move = (index: number, delta: number) => {
    const current = rows[index]
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) return
    if (rows[targetIndex].parent_id !== current.parent_id) return
    setRows(arrayMove(rows, index, targetIndex))
  }

  const saveOrder = async () => {
    const payload: { id: string; sort: number }[] = []
    const counters = new Map<string | null, number>()

    for (const row of rows) {
      const key = row.parent_id ?? null
      const next = counters.get(key) ?? 0
      payload.push({ id: row.id, sort: next })
      counters.set(key, next + 1)
    }

    try {
      await apiRequest('/api/admin/categories/order', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['categories'] }),
        qc.invalidateQueries({ queryKey: ['categories-all'] }),
        qc.invalidateQueries({ queryKey: ['categories-for-products'] }),
        qc.invalidateQueries({ queryKey: ['root-categories'] }),
        qc.invalidateQueries({ queryKey: ['catalog-tree'] }),
        qc.invalidateQueries({
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'child-categories',
        }),
      ])

      alert('Порядок категорий сохранён')
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить порядок')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию? Убедитесь, что в ней нет товаров и подкатегорий.')) return

    try {
      await apiRequest(`/api/admin/categories/${id}`, { method: 'DELETE' })

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['categories'] }),
        qc.invalidateQueries({ queryKey: ['categories-all'] }),
        qc.invalidateQueries({ queryKey: ['categories-for-products'] }),
        qc.invalidateQueries({ queryKey: ['root-categories'] }),
        qc.invalidateQueries({ queryKey: ['catalog-tree'] }),
        qc.invalidateQueries({
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'child-categories',
        }),
      ])
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить категорию')
    }
  }

  const withImagesCount = rows.filter((row) => row.image_url).length
  const isReorderLocked = search.trim().length > 0

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Структура каталога</p>
          <h1 className={styles.title}>Категории</h1>
          <p className={styles.subtitle}>
            Ищите разделы по совпадениям в названии и slug, фильтруйте по родителю
            и управляйте порядком внутри выбранной ветки.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonSecondary} onClick={saveOrder} disabled={isReorderLocked}>
            Сохранить порядок
          </button>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Найдено</div>
          <div className={styles.statValue}>{rows.length}</div>
          <div className={styles.statMeta}>Категории в текущей выборке.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>С изображением</div>
          <div className={styles.statValue}>{withImagesCount}</div>
          <div className={styles.statMeta}>Разделы, у которых уже есть картинка.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Без изображения</div>
          <div className={styles.statValue}>{rows.length - withImagesCount}</div>
          <div className={styles.statMeta}>Можно догрузить через редактирование или импорт.</div>
        </div>
      </div>

      <CategoryForm editing={editing} onDone={() => setEditing(null)} />

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <input
              className={styles.input}
              placeholder="Поиск: название или slug"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={parentFilter}
              onChange={(event) => setParentFilter(event.target.value)}
            >
              <option value="">Все категории</option>
              <option value="__root__">Только корневые</option>
              {optionsQ.data?.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {q.isLoading ? <div className={styles.inlineNotice}>Загрузка категорий...</div> : null}
      {q.isError ? <div className={styles.errorNotice}>Не удалось загрузить категории.</div> : null}

      {!q.isLoading && !q.isError && rows.length === 0 ? (
        <div className={styles.emptyState}>По текущему фильтру категории не найдены.</div>
      ) : null}

      {!q.isLoading && !q.isError && rows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Порядок</th>
                <th>Категория</th>
                <th>Slug</th>
                <th>Родитель</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((category, index) => (
                <tr key={category.id}>
                  <td>
                    <div className={styles.toolbarGroup}>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || rows[index - 1]?.parent_id !== category.parent_id || isReorderLocked}
                      >
                        ↑
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, +1)}
                        disabled={index === rows.length - 1 || rows[index + 1]?.parent_id !== category.parent_id || isReorderLocked}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.tableTitle}>
                      <span className={styles.tablePrimary}>{category.title}</span>
                      <span className={styles.tableSecondary}>
                        {category.image_url ? 'Есть изображение' : 'Без изображения'}
                      </span>
                    </div>
                  </td>
                  <td>{category.slug || '—'}</td>
                  <td>{category.parent_id ? titleMap.get(category.parent_id) || 'Родитель не найден' : 'Корневая'}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <button className={styles.buttonSecondary} onClick={() => setEditing(category)}>
                        Редактировать
                      </button>
                      <button className={styles.buttonDanger} onClick={() => handleDelete(category.id)}>
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
          Перестановка временно отключена, пока включён поиск. Очистите строку поиска,
          чтобы менять порядок категорий.
        </div>
      ) : null}
    </div>
  )
}
