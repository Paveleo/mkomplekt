import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CatalogIcon,
  EditIcon,
  FolderIcon,
  ImageIcon,
  NoImageIcon,
  TrashIcon,
} from '@/admin/AdminIcons'
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
  is_visible?: boolean
}

type CategoryOption = {
  id: string
  title: string
  parent_id?: string | null
  is_visible?: boolean
}

const ROOT_PARENT = '__root__'

function parentKey(parentId?: string | null) {
  return parentId || ROOT_PARENT
}

function buildBreadcrumbs(categoryId: string, categoryMap: Map<string, CategoryOption>) {
  const result: CategoryOption[] = []
  let current = categoryMap.get(categoryId)

  while (current) {
    result.unshift(current)
    current = current.parent_id ? categoryMap.get(current.parent_id) : undefined
  }

  return result
}

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Row | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [activeParentId, setActiveParentId] = useState(ROOT_PARENT)

  const optionsQ = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => apiRequest<CategoryOption[]>('/api/admin/categories/options'),
  })

  const categories = optionsQ.data || []

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]))
  }, [categories])

  const childrenCountMap = useMemo(() => {
    const next = new Map<string, number>()
    for (const category of categories) {
      if (!category.parent_id) {
        continue
      }
      next.set(category.parent_id, (next.get(category.parent_id) || 0) + 1)
    }
    return next
  }, [categories])

  const q = useQuery({
    queryKey: ['categories', search, activeParentId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.trim()) {
        params.set('search', search.trim())
      }
      if (activeParentId) {
        params.set('parent_id', activeParentId)
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
    () => new Map(categories.map((row) => [row.id, row.title])),
    [categories],
  )

  const breadcrumbs = activeParentId && activeParentId !== ROOT_PARENT
    ? buildBreadcrumbs(activeParentId, categoryMap)
    : []

  const activeTitle =
    activeParentId === ROOT_PARENT
      ? 'Корневые категории'
      : categoryMap.get(activeParentId)?.title || 'Все категории'

  const move = (index: number, delta: number) => {
    const current = rows[index]
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) return
    if (rows[targetIndex].parent_id !== current.parent_id) return
    setRows(arrayMove(rows, index, targetIndex))
  }

  const invalidateCatalogQueries = async () => {
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
  }

  const saveOrder = async () => {
    const payload = rows.map((row, index) => ({ id: row.id, sort: index }))

    try {
      await apiRequest('/api/admin/categories/order', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      await invalidateCatalogQueries()
      alert('Порядок категорий сохранен')
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить порядок')
    }
  }

  const handleDelete = async (category: Row) => {
    if (!confirm(`Удалить категорию "${category.title}"? Убедитесь, что в ней нет товаров и подкатегорий.`)) {
      return
    }

    try {
      await apiRequest(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
      await invalidateCatalogQueries()
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить категорию')
    }
  }

  const handleToggleVisibility = async (category: Row) => {
    const nextVisible = category.is_visible === false
    setRows((current) =>
      current.map((row) => (row.id === category.id ? { ...row, is_visible: nextVisible } : row)),
    )

    try {
      await apiRequest(`/api/admin/categories/${category.id}/visibility`, {
        method: 'PUT',
        body: JSON.stringify({ is_visible: nextVisible }),
      })
      await invalidateCatalogQueries()
    } catch (error: any) {
      setRows((current) =>
        current.map((row) => (row.id === category.id ? { ...row, is_visible: category.is_visible } : row)),
      )
      alert(error.message || 'Не удалось изменить видимость категории')
    }
  }

  const withImagesCount = rows.filter((row) => row.image_url).length
  const visibleCount = rows.filter((row) => row.is_visible !== false).length
  const isReorderLocked = search.trim().length > 0 || activeParentId === ''

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Структура каталога</p>
          <h1 className={styles.title}>Категории</h1>
          <p className={styles.subtitle}>
            Работайте с категориями как с папками: открывайте нужный раздел прямо из карточки,
            меняйте порядок, изображения и основные данные без лишней боковой панели.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonSecondary} onClick={saveOrder} disabled={isReorderLocked}>
            Сохранить порядок
          </button>
        </div>
      </div>

      <CategoryForm editing={null} onDone={() => setEditing(null)} />

      {editing ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setEditing(null)}>
          <div
            className={styles.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Редактирование категории"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Закрыть"
              onClick={() => setEditing(null)}
            >
              ×
            </button>
            <CategoryForm editing={editing} onDone={() => setEditing(null)} />
          </div>
        </div>
      ) : null}

      <main className={styles.folderMain}>
          <div className={styles.card}>
            <div className={styles.folderTopbar}>
              <div>
                <div className={styles.breadcrumbs}>
                  <button type="button" onClick={() => setActiveParentId(ROOT_PARENT)}>Каталог</button>
                  {breadcrumbs.map((category) => (
                    <button type="button" key={category.id} onClick={() => setActiveParentId(category.id)}>
                      / {category.title}
                    </button>
                  ))}
                </div>
                <h2 className={styles.cardTitle}>{activeTitle}</h2>
                <p className={styles.cardText}>
                  Найдено категорий: {rows.length}. С изображением: {withImagesCount}. Без изображения: {rows.length - withImagesCount}.
                </p>
              </div>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.toolbarGroup}>
                <button
                  type="button"
                  className={activeParentId === ROOT_PARENT ? styles.buttonPrimary : styles.buttonSecondary}
                  onClick={() => setActiveParentId(ROOT_PARENT)}
                >
                  <CatalogIcon className={styles.buttonIcon} />
                  Корневые категории
                </button>
                <button
                  type="button"
                  className={activeParentId === '' ? styles.buttonPrimary : styles.buttonSecondary}
                  onClick={() => setActiveParentId('')}
                >
                  <CatalogIcon className={styles.buttonIcon} />
                  Все категории
                </button>
                <input
                  className={styles.input}
                  placeholder="Поиск: название или slug"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>В текущей ветке</div>
              <div className={styles.statValue}>{rows.length}</div>
              <div className={styles.statMeta}>Категории в выбранной папке или поиске.</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>С изображением</div>
              <div className={styles.statValue}>{withImagesCount}</div>
              <div className={styles.statMeta}>Разделы, у которых уже есть картинка.</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Без изображения</div>
              <div className={styles.statValue}>{rows.length - withImagesCount}</div>
              <div className={styles.statMeta}>Можно догрузить через редактирование или раздел фото.</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Видны на сайте</div>
              <div className={styles.statValue}>{visibleCount}</div>
              <div className={styles.statMeta}>Скрытые папки не отображаются вместе со всей веткой.</div>
            </div>
          </div>

          {q.isLoading ? <div className={styles.inlineNotice}>Загрузка категорий...</div> : null}
          {q.isError ? <div className={styles.errorNotice}>Не удалось загрузить категории.</div> : null}

          {!q.isLoading && !q.isError && rows.length === 0 ? (
            <div className={styles.emptyState}>В этой ветке категорий не найдено.</div>
          ) : null}

          {!q.isLoading && !q.isError && rows.length > 0 ? (
            <div className={styles.categoryGrid}>
              {rows.map((category, index) => (
                <article key={category.id} className={styles.categoryAdminCard}>
                  <div className={styles.categoryCardTop}>
                    <div className={styles.categoryIconBox}>
                      <FolderIcon className={styles.iconSvgLarge} />
                    </div>
                    <div className={styles.toolbarGroup}>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || rows[index - 1]?.parent_id !== category.parent_id || isReorderLocked}
                        title="Выше"
                      >
                        <ArrowUpIcon className={styles.iconSvg} />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, +1)}
                        disabled={index === rows.length - 1 || rows[index + 1]?.parent_id !== category.parent_id || isReorderLocked}
                        title="Ниже"
                      >
                        <ArrowDownIcon className={styles.iconSvg} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.categoryCardBody}>
                    <h3>{category.title}</h3>
                    <p>{category.slug || 'slug не указан'}</p>
                    <button
                      type="button"
                      className={`${category.is_visible === false ? styles.statusCancelled : styles.statusCompleted} ${styles.statusButton}`}
                      onClick={() => handleToggleVisibility(category)}
                      title={category.is_visible === false ? 'Показать папку на сайте' : 'Скрыть папку с сайта'}
                    >
                      {category.is_visible === false ? 'Скрыта' : 'Видна'}
                    </button>
                  </div>

                  <div className={styles.categoryMetaGrid}>
                    <span>
                      <FolderIcon className={styles.iconSvgSmall} />
                      Подпапок: {childrenCountMap.get(category.id) || 0}
                    </span>
                    <span>
                      {category.image_url ? (
                        <ImageIcon className={styles.iconSvgSmall} />
                      ) : (
                        <NoImageIcon className={styles.iconSvgSmall} />
                      )}
                      {category.image_url ? 'Есть изображение' : 'Без изображения'}
                    </span>
                    <span>
                      <CatalogIcon className={styles.iconSvgSmall} />
                      {category.parent_id ? titleMap.get(category.parent_id) || 'Родитель не найден' : 'Корневая'}
                    </span>
                    <span>
                      <CatalogIcon className={styles.iconSvgSmall} />
                      {category.is_visible === false ? 'Скрыта с сайта' : 'Показывается на сайте'}
                    </span>
                  </div>

                  <div className={styles.categoryCardActions}>
                    <button className={styles.buttonSecondary} onClick={() => setActiveParentId(category.id)}>
                      <FolderIcon className={styles.buttonIcon} />
                      Открыть
                    </button>
                    <button className={styles.buttonSecondary} onClick={() => setEditing(category)}>
                      <EditIcon className={styles.buttonIcon} />
                      Редактировать
                    </button>
                    <button className={styles.buttonDanger} onClick={() => handleDelete(category)}>
                      <TrashIcon className={styles.buttonIcon} />
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {isReorderLocked ? (
            <div className={styles.inlineNotice}>
              Чтобы менять порядок, выберите конкретную ветку и очистите поиск.
            </div>
          ) : null}
      </main>
    </div>
  )
}
