import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiRequest } from '@/lib/api'
import { ArrowDownIcon, ArrowUpIcon, BoxIcon, CatalogIcon, FolderIcon } from '@/admin/AdminIcons'
import ProductForm from './ProductForm'
import { arrayMove } from '../../utils/arrayMove'
import styles from '../admin.module.css'

type ProductImage = {
  id: string
  url: string
  sort: number
}

type AdminProduct = {
  id: string
  title: string
  slug: string
  sku?: string | null
  is_published: boolean
  category_id: string
  category_title: string
  sort: number
  price?: number | null
  size?: string | null
  thickness?: number | null
  color?: string | null
  unit?: string | null
  material?: string | null
  description?: string | null
  images?: ProductImage[]
}

type CategoryOption = {
  id: string
  title: string
  parent_id?: string | null
}

type BulkImageMode = 'keep' | 'replace' | 'clear'

function toFormValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? '' : String(value)
}

function categoryParentKey(parentId?: string | null) {
  return parentId || '__root__'
}

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'Цена не указана'
  }

  return `${value.toLocaleString('ru-RU')} ₽`
}

function CategoryTree({
  activeCategoryId,
  categoriesByParent,
  dragOverCategoryId,
  canDropProduct,
  level = 0,
  parentId = null,
  onSelect,
  onMoveProductToCategory,
  onDragOverCategory,
  onDragLeaveCategory,
}: {
  activeCategoryId: string
  categoriesByParent: Map<string, CategoryOption[]>
  dragOverCategoryId: string
  canDropProduct: boolean
  level?: number
  parentId?: string | null
  onSelect: (categoryId: string) => void
  onMoveProductToCategory: (categoryId: string) => void
  onDragOverCategory: (categoryId: string) => void
  onDragLeaveCategory: (categoryId: string) => void
}) {
  const rows = categoriesByParent.get(categoryParentKey(parentId)) || []

  if (!rows.length) {
    return null
  }

  return (
    <div className={styles.folderTreeLevel}>
      {rows.map((category) => (
        <div key={category.id}>
          <button
            type="button"
            className={[
              category.id === activeCategoryId ? styles.folderButtonActive : styles.folderButton,
              canDropProduct && dragOverCategoryId === category.id ? styles.folderButtonDropTarget : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ paddingLeft: 14 + level * 16 }}
            onClick={() => onSelect(category.id)}
            onDragEnter={() => {
              if (canDropProduct) {
                onDragOverCategory(category.id)
              }
            }}
            onDragOver={(event) => {
              if (!canDropProduct) {
                return
              }
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              onDragOverCategory(category.id)
            }}
            onDragLeave={() => onDragLeaveCategory(category.id)}
            onDrop={(event) => {
              if (!canDropProduct) {
                return
              }
              event.preventDefault()
              onMoveProductToCategory(category.id)
            }}
          >
            <FolderIcon className={styles.iconSvg} />
            <span>{category.title}</span>
          </button>

          <CategoryTree
            activeCategoryId={activeCategoryId}
            categoriesByParent={categoriesByParent}
            dragOverCategoryId={dragOverCategoryId}
            canDropProduct={canDropProduct}
            level={level + 1}
            parentId={category.id}
            onSelect={onSelect}
            onMoveProductToCategory={onMoveProductToCategory}
            onDragOverCategory={onDragOverCategory}
            onDragLeaveCategory={onDragLeaveCategory}
          />
        </div>
      ))}
    </div>
  )
}

export default function ProductsPage() {
  const qc = useQueryClient()

  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [imageFilter, setImageFilter] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<AdminProduct[]>([])
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkImageMode, setBulkImageMode] = useState<BulkImageMode>('keep')
  const [bulkImageFiles, setBulkImageFiles] = useState<File[]>([])
  const [bulkImageInputKey, setBulkImageInputKey] = useState(0)
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [bulkTargetCategoryId, setBulkTargetCategoryId] = useState('')
  const [isBulkMoving, setIsBulkMoving] = useState(false)
  const [draggedProductId, setDraggedProductId] = useState('')
  const [dragOverCategoryId, setDragOverCategoryId] = useState('')
  const [isMovingProduct, setIsMovingProduct] = useState(false)

  const catsQ = useQuery({
    queryKey: ['categories-for-products'],
    queryFn: async () => apiRequest<CategoryOption[]>('/api/admin/categories/options'),
  })

  const categories = catsQ.data || []

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]))
  }, [categories])

  const categoriesByParent = useMemo(() => {
    const next = new Map<string, CategoryOption[]>()
    for (const category of categories) {
      const key = categoryParentKey(category.parent_id)
      next.set(key, [...(next.get(key) || []), category])
    }
    return next
  }, [categories])

  const activeCategory = activeCategoryId ? categoryMap.get(activeCategoryId) : null
  const childCategories = categoriesByParent.get(categoryParentKey(activeCategoryId || null)) || []

  const breadcrumbs = useMemo(() => {
    const result: CategoryOption[] = []
    let current: CategoryOption | undefined = activeCategory || undefined
    while (current) {
      result.unshift(current)
      current = current.parent_id ? categoryMap.get(current.parent_id) : undefined
    }
    return result
  }, [activeCategory, categoryMap])

  const q = useQuery({
    queryKey: ['products-admin', activeCategoryId, statusFilter, imageFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeCategoryId) {
        params.set('category_id', activeCategoryId)
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
    if (!q.data) {
      return
    }

    setRows(q.data)
    setSelectedIds((current) => current.filter((id) => q.data.some((row) => row.id === id)))
  }, [q.data])

  useEffect(() => {
    if (selectedIds.length > 0) {
      return
    }

    setBulkImageMode('keep')
    setBulkImageFiles([])
    setBulkTargetCategoryId('')
    setBulkImageInputKey((current) => current + 1)
  }, [selectedIds])

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  )
  const canDropProduct = Boolean(draggedProductId) && !isMovingProduct

  const publishedCount = useMemo(
    () => rows.filter((row) => row.is_published).length,
    [rows],
  )

  const selectedImagesCount = useMemo(
    () => selectedRows.reduce((total, row) => total + (row.images?.length || 0), 0),
    [selectedRows],
  )

  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id))
  const isReorderLocked =
    !activeCategoryId ||
    search.trim().length > 0 ||
    statusFilter.length > 0 ||
    imageFilter.length > 0 ||
    selectedIds.length > 0

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return
    }
    setRows(arrayMove(rows, index, targetIndex))
  }

  const saveOrder = async () => {
    if (!activeCategoryId) {
      alert('Выберите папку категории, чтобы сохранить порядок товаров внутри нее.')
      return
    }

    const pairs = rows.map((row, index) => ({ id: row.id, sort: index }))

    try {
      await apiRequest('/api/admin/products/order', {
        method: 'PUT',
        body: JSON.stringify(pairs),
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products-admin'] }),
        qc.invalidateQueries({ queryKey: ['products'] }),
      ])
      alert('Порядок товаров сохранен')
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить порядок')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) {
      return
    }

    try {
      await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' })
      await qc.invalidateQueries({ queryKey: ['products-admin'] })
      setSelectedIds((current) => current.filter((item) => item !== id))
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить товар')
    }
  }

  const toggleSelected = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(rows.map((row) => row.id))
  }

  const updateSelectedRow = (productId: string, patch: Partial<AdminProduct>) => {
    setRows((current) =>
      current.map((row) => (row.id === productId ? { ...row, ...patch } : row)),
    )
  }

  const handleBulkFilesSelected = (files: FileList | null) => {
    const nextFiles = files ? Array.from(files) : []
    setBulkImageFiles(nextFiles)
    if (nextFiles.length > 0) {
      setBulkImageMode('replace')
    }
  }

  const clearBulkFiles = () => {
    setBulkImageFiles([])
    setBulkImageInputKey((current) => current + 1)
  }

  const buildProductBaseFormData = (product: AdminProduct, categoryId = product.category_id) => {
    const formData = new FormData()
    formData.set('title', product.title)
    formData.set('sku', product.sku || '')
    formData.set('category_id', categoryId)
    formData.set('price', toFormValue(product.price))
    formData.set('size', product.size || '')
    formData.set('thickness', toFormValue(product.thickness))
    formData.set('color', product.color || '')
    formData.set('unit', product.unit || '')
    formData.set('material', product.material || '')
    formData.set('description', product.description || '')
    formData.set('is_published', product.is_published ? 'true' : 'false')
    return formData
  }

  const buildProductUpdateFormData = (product: AdminProduct) => {
    const formData = buildProductBaseFormData(product)

    if (bulkImageMode === 'replace') {
      bulkImageFiles.forEach((file) => {
        formData.append('images', file)
      })
    } else if (bulkImageMode === 'clear') {
      formData.append('keep_image_ids', '')
    }

    return formData
  }

  const saveSelected = async () => {
    if (!selectedRows.length) {
      return
    }
    if (bulkImageMode === 'replace' && bulkImageFiles.length === 0) {
      alert('Выберите новые изображения для массовой замены фото.')
      return
    }

    setIsBulkSaving(true)
    try {
      for (const product of selectedRows) {
        await apiRequest(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          body: buildProductUpdateFormData(product),
        })
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products-admin'] }),
        qc.invalidateQueries({ queryKey: ['products'] }),
        qc.invalidateQueries({ queryKey: ['product'] }),
      ])

      if (bulkImageMode !== 'keep') {
        clearBulkFiles()
        setBulkImageMode('keep')
      }
      alert('Выбранные товары обновлены')
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить выбранные товары')
    } finally {
      setIsBulkSaving(false)
    }
  }

  const deleteSelected = async () => {
    if (!selectedRows.length) {
      return
    }
    if (!confirm(`Удалить выбранные товары: ${selectedRows.length}?`)) {
      return
    }

    setIsBulkDeleting(true)
    try {
      for (const product of selectedRows) {
        await apiRequest(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      }
      await qc.invalidateQueries({ queryKey: ['products-admin'] })
      setSelectedIds([])
      alert('Выбранные товары удалены')
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить выбранные товары')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const moveSelectedToCategory = async () => {
    if (!selectedRows.length || !bulkTargetCategoryId) {
      return
    }

    const targetCategory = categoryMap.get(bulkTargetCategoryId)
    if (!targetCategory) {
      alert('Выберите папку для переноса')
      return
    }

    const productsToUpdate = selectedRows.filter((row) => row.category_id !== bulkTargetCategoryId)
    if (productsToUpdate.length === 0) {
      alert('Выбранные товары уже находятся в этой папке')
      return
    }

    setIsBulkMoving(true)
    try {
      for (const product of productsToUpdate) {
        await apiRequest(`/api/admin/products/${product.id}/category`, {
          method: 'PATCH',
          body: JSON.stringify({ category_id: bulkTargetCategoryId }),
        })
      }

      const movedIds = new Set(productsToUpdate.map((row) => row.id))
      setRows((current) =>
        activeCategoryId && activeCategoryId !== bulkTargetCategoryId
          ? current.filter((row) => !movedIds.has(row.id))
          : current.map((row) =>
              movedIds.has(row.id)
                ? {
                    ...row,
                    category_id: bulkTargetCategoryId,
                    category_title: targetCategory.title,
                  }
                : row,
            ),
      )
      setSelectedIds((current) => current.filter((id) => !movedIds.has(id)))
      setBulkTargetCategoryId('')

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products-admin'] }),
        qc.invalidateQueries({ queryKey: ['products'] }),
        qc.invalidateQueries({ queryKey: ['product'] }),
      ])

      alert(`Перенесено товаров: ${productsToUpdate.length}`)
    } catch (error: any) {
      alert(error.message || 'Не удалось перенести выбранные товары')
    } finally {
      setIsBulkMoving(false)
    }
  }

  const moveDraggedProductToCategory = async (targetCategoryId: string) => {
    if (!draggedProductId || isMovingProduct) {
      return
    }

    const product = rows.find((row) => row.id === draggedProductId)
    const targetCategory = categoryMap.get(targetCategoryId)
    if (!product || !targetCategory) {
      setDraggedProductId('')
      setDragOverCategoryId('')
      return
    }

    const productsToMove = selectedIds.includes(product.id) && selectedRows.length > 0 ? selectedRows : [product]
    const productsToUpdate = productsToMove.filter((row) => row.category_id !== targetCategoryId)

    if (productsToUpdate.length === 0) {
      setDraggedProductId('')
      setDragOverCategoryId('')
      return
    }

    setIsMovingProduct(true)
    try {
      for (const item of productsToUpdate) {
        await apiRequest(`/api/admin/products/${item.id}/category`, {
          method: 'PATCH',
          body: JSON.stringify({ category_id: targetCategoryId }),
        })
      }

      const movedIds = new Set(productsToUpdate.map((row) => row.id))

      setRows((current) =>
        activeCategoryId && activeCategoryId !== targetCategoryId
          ? current.filter((row) => !movedIds.has(row.id))
          : current.map((row) =>
              movedIds.has(row.id)
                ? {
                    ...row,
                    category_id: targetCategoryId,
                    category_title: targetCategory.title,
                  }
                : row,
            ),
      )
      setSelectedIds((current) => current.filter((id) => !movedIds.has(id)))

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products-admin'] }),
        qc.invalidateQueries({ queryKey: ['products'] }),
        qc.invalidateQueries({ queryKey: ['product'] }),
      ])
    } catch (error: any) {
      alert(error.message || 'Не удалось перенести товар в папку')
    } finally {
      setIsMovingProduct(false)
      setDraggedProductId('')
      setDragOverCategoryId('')
    }
  }

  const handleCategoryDragLeave = (categoryId: string) => {
    setDragOverCategoryId((current) => (current === categoryId ? '' : current))
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Каталог</p>
          <h1 className={styles.title}>Папки и товары</h1>
          <p className={styles.subtitle}>
            Выберите папку категории слева, откройте подпапку или товар справа. Поля размера, толщины, цвета,
            единицы измерения, артикула и цены можно менять у выбранных товаров массово.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/products/new" className={styles.buttonPrimary}>Новый товар</Link>
          <button className={styles.buttonSecondary} onClick={saveOrder} disabled={isReorderLocked}>
            Сохранить порядок
          </button>
        </div>
      </div>

      <div className={styles.catalogExplorer}>
        <aside className={styles.folderSidebar}>
          <div className={styles.folderSidebarHeader}>
            <h2 className={styles.cardTitle}>Папки</h2>
            <Link to="/admin/categories" className={styles.buttonGhost}>Редактировать</Link>
          </div>

          <button
            type="button"
            className={!activeCategoryId ? styles.folderButtonActive : styles.folderButton}
            onClick={() => setActiveCategoryId('')}
          >
            <CatalogIcon className={styles.iconSvg} />
            <span>Весь каталог</span>
          </button>

          {catsQ.isLoading ? <div className={styles.inlineNotice}>Загружаем папки...</div> : null}
          {catsQ.isError ? <div className={styles.errorNotice}>Не удалось загрузить категории.</div> : null}

          <CategoryTree
            activeCategoryId={activeCategoryId}
            categoriesByParent={categoriesByParent}
            dragOverCategoryId={dragOverCategoryId}
            canDropProduct={canDropProduct}
            onSelect={setActiveCategoryId}
            onMoveProductToCategory={moveDraggedProductToCategory}
            onDragOverCategory={setDragOverCategoryId}
            onDragLeaveCategory={handleCategoryDragLeave}
          />
        </aside>

        <main className={styles.folderMain}>
          <div className={styles.card}>
            <div className={styles.folderTopbar}>
              <div>
                <div className={styles.breadcrumbs}>
                  <button type="button" onClick={() => setActiveCategoryId('')}>Каталог</button>
                  {breadcrumbs.map((category) => (
                    <button type="button" key={category.id} onClick={() => setActiveCategoryId(category.id)}>
                      / {category.title}
                    </button>
                  ))}
                </div>
                <h2 className={styles.cardTitle}>{activeCategory?.title || 'Весь каталог'}</h2>
                <p className={styles.cardText}>
                  {activeCategoryId
                    ? `В папке товаров: ${rows.length}. Подпапок: ${childCategories.length}.`
                    : `Всего в текущей выборке товаров: ${rows.length}. Выберите папку, чтобы редактировать порядок.`}
                </p>
              </div>

              <label className={styles.selectAllBox}>
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
                <span>Выбрать видимые</span>
              </label>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.toolbarGroup}>
                <input
                  className={styles.input}
                  placeholder="Поиск: название, SKU, цвет, размер"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
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

          {childCategories.length > 0 ? (
            <div className={styles.folderGrid}>
              {childCategories.map((category) => (
                <button
                  type="button"
                  className={[
                    styles.folderCard,
                    canDropProduct && dragOverCategoryId === category.id ? styles.folderCardDropTarget : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  onDragEnter={() => {
                    if (canDropProduct) {
                      setDragOverCategoryId(category.id)
                    }
                  }}
                  onDragOver={(event) => {
                    if (!canDropProduct) {
                      return
                    }
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setDragOverCategoryId(category.id)
                  }}
                  onDragLeave={() => handleCategoryDragLeave(category.id)}
                  onDrop={(event) => {
                    if (!canDropProduct) {
                      return
                    }
                    event.preventDefault()
                    moveDraggedProductToCategory(category.id)
                  }}
                >
                  <FolderIcon className={styles.iconSvgLarge} />
                  <span className={styles.folderCardTitle}>{category.title}</span>
                  <span className={styles.folderCardMeta}>
                    Подпапок: {(categoriesByParent.get(category.id) || []).length}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.cardGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Найдено</div>
              <div className={styles.statValue}>{rows.length}</div>
              <div className={styles.statMeta}>Товары в текущей папке или выборке.</div>
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

          {selectedRows.length > 0 ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Выбрано товаров: {selectedRows.length}</h2>
                  <p className={styles.cardText}>
                    Быстро поменяйте характеристики, артикулы, цены или фотографии у выбранных товаров.
                  </p>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.buttonPrimary}
                    onClick={saveSelected}
                    disabled={isBulkSaving || isBulkDeleting || isBulkMoving}
                  >
                    {isBulkSaving ? 'Сохраняю...' : 'Сохранить выбранные'}
                  </button>
                  <button
                    type="button"
                    className={styles.buttonDanger}
                    onClick={deleteSelected}
                    disabled={isBulkSaving || isBulkDeleting || isBulkMoving}
                  >
                    {isBulkDeleting ? 'Удаляю...' : 'Удалить выбранные'}
                  </button>
                  <button
                    type="button"
                    className={styles.buttonGhost}
                    onClick={() => setSelectedIds([])}
                    disabled={isBulkSaving || isBulkDeleting || isBulkMoving}
                  >
                    Снять выбор
                  </button>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Массовые фото</h3>
                <p className={styles.sectionDescription}>
                  Сейчас у выбранных товаров фотографий: <strong>{selectedImagesCount}</strong>.
                </p>

                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Действие с фото</span>
                    <select
                      className={styles.select}
                      value={bulkImageMode}
                      onChange={(event) => setBulkImageMode(event.target.value as BulkImageMode)}
                    >
                      <option value="keep">Фото не менять</option>
                      <option value="replace">Заменить фото у выбранных</option>
                      <option value="clear">Удалить все фото у выбранных</option>
                    </select>
                  </label>

                  {bulkImageMode === 'replace' ? (
                    <label className={styles.fieldWide}>
                      <span className={styles.fieldLabel}>Новые фото</span>
                      <input
                        key={bulkImageInputKey}
                        className={styles.input}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) => handleBulkFilesSelected(event.target.files)}
                      />
                      <span className={styles.fieldHint}>
                        Файлы заменят текущую галерею у каждого выбранного товара.
                      </span>
                    </label>
                  ) : null}
                </div>

                {bulkImageFiles.length > 0 ? (
                  <div className={styles.inlineNotice}>
                    Подготовлено файлов: <strong>{bulkImageFiles.length}</strong>
                    <button type="button" className={styles.buttonGhost} onClick={clearBulkFiles}>
                      Очистить
                    </button>
                  </div>
                ) : null}
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Массовый перенос в папку</h3>
                <p className={styles.sectionDescription}>
                  Переносит выбранные товары вместе с привязанными изображениями в другую папку каталога. Сами фото не заменяются.
                </p>

                <div className={styles.formGrid}>
                  <label className={styles.fieldWide}>
                    <span className={styles.fieldLabel}>Папка назначения</span>
                    <select
                      className={styles.select}
                      value={bulkTargetCategoryId}
                      onChange={(event) => setBulkTargetCategoryId(event.target.value)}
                    >
                      <option value="">Выберите папку</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Действие</span>
                    <button
                      type="button"
                      className={styles.buttonPrimary}
                      onClick={moveSelectedToCategory}
                      disabled={!bulkTargetCategoryId || isBulkMoving || isBulkSaving || isBulkDeleting}
                    >
                      {isBulkMoving ? 'Переношу...' : 'Перенести выбранные'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.selectionList}>
                {selectedRows.map((product) => (
                  <div key={product.id} className={styles.selectionRow}>
                    <div className={styles.selectionMeta}>
                      <div className={styles.tablePrimary}>{product.title}</div>
                      <div className={styles.tableSecondary}>
                        {product.category_title} • {product.images?.length ? `Фото: ${product.images.length}` : 'Без фото'}
                      </div>
                    </div>

                    <div className={styles.selectionFieldsWide}>
                      <label className={styles.fieldWide}>
                        <span className={styles.fieldLabel}>Название</span>
                        <input
                          className={styles.input}
                          value={product.title}
                          onChange={(event) => updateSelectedRow(product.id, { title: event.target.value })}
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Артикул</span>
                        <input
                          className={styles.input}
                          value={product.sku || ''}
                          onChange={(event) => updateSelectedRow(product.id, { sku: event.target.value })}
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Цена</span>
                        <input
                          className={styles.input}
                          type="number"
                          step="0.01"
                          value={product.price ?? ''}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            updateSelectedRow(product.id, { price: nextValue === '' ? null : Number(nextValue) })
                          }}
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Размер</span>
                        <input
                          className={styles.input}
                          value={product.size || ''}
                          onChange={(event) => updateSelectedRow(product.id, { size: event.target.value })}
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Толщина</span>
                        <input
                          className={styles.input}
                          type="number"
                          step="0.1"
                          value={product.thickness ?? ''}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            updateSelectedRow(product.id, { thickness: nextValue === '' ? null : Number(nextValue) })
                          }}
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Цвет</span>
                        <input
                          className={styles.input}
                          value={product.color || ''}
                          onChange={(event) => updateSelectedRow(product.id, { color: event.target.value })}
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Ед. измерения</span>
                        <input
                          className={styles.input}
                          value={product.unit || ''}
                          onChange={(event) => updateSelectedRow(product.id, { unit: event.target.value })}
                        />
                      </label>
                    </div>

                    <div className={styles.tableActions}>
                      <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={() => setEditingProductId(product.id)}
                      >
                        Карточка
                      </button>
                      <button
                        type="button"
                        className={styles.buttonGhost}
                        onClick={() => toggleSelected(product.id)}
                      >
                        Убрать
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {q.isLoading ? <div className={styles.inlineNotice}>Загрузка товаров...</div> : null}
          {q.isError ? <div className={styles.errorNotice}>Не удалось загрузить список товаров.</div> : null}

          {!q.isLoading && !q.isError && rows.length === 0 ? (
            <div className={styles.emptyState}>В этой папке или выборке товаров не найдено.</div>
          ) : null}

          {!q.isLoading && !q.isError && rows.length > 0 ? (
            <div className={styles.productGrid}>
              {rows.map((product, index) => (
                <article
                  key={product.id}
                  className={[
                    styles.productAdminCard,
                    draggedProductId === product.id ? styles.productAdminCardDragging : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  draggable={!isMovingProduct}
                  onDragStart={(event) => {
                    setDraggedProductId(product.id)
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', product.id)
                  }}
                  onDragEnd={() => {
                    setDraggedProductId('')
                    setDragOverCategoryId('')
                  }}
                >
                  <div className={styles.productCardHeader}>
                    <label className={styles.selectAllBox}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelected(product.id)}
                      />
                      <span>Выбрать</span>
                    </label>
                    <span className={product.is_published ? styles.statusCompleted : styles.statusCancelled}>
                      {product.is_published ? 'Опубликован' : 'Скрыт'}
                    </span>
                  </div>

                  <div className={styles.productThumb}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} />
                    ) : (
                      <span className={styles.noPhotoLabel}>
                        <BoxIcon className={styles.iconSvg} />
                        Без фото
                      </span>
                    )}
                  </div>

                  <div className={styles.productCardBody}>
                    <h3>{product.title}</h3>
                    <p>{product.category_title}</p>
                    <div className={styles.productSpecs}>
                      <span>{formatPrice(product.price)}</span>
                      {product.sku ? <span>SKU: {product.sku}</span> : null}
                      {product.size ? <span>Размер: {product.size}</span> : null}
                      {product.thickness ? <span>Толщина: {product.thickness} мм</span> : null}
                      {product.color ? <span>Цвет: {product.color}</span> : null}
                      {product.unit ? <span>Ед.: {product.unit}</span> : null}
                    </div>
                  </div>

                  <div className={styles.productCardActions}>
                    <div className={styles.toolbarGroup}>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || isReorderLocked}
                      >
                        <ArrowUpIcon className={styles.iconSvg} />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => move(index, +1)}
                        disabled={index === rows.length - 1 || isReorderLocked}
                      >
                        <ArrowDownIcon className={styles.iconSvg} />
                      </button>
                    </div>

                    <div className={styles.tableActions}>
                      <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={() => setEditingProductId(product.id)}
                      >
                        Редактировать
                      </button>
                      <button className={styles.buttonDanger} onClick={() => handleDelete(product.id)}>
                        Удалить
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {isReorderLocked ? (
            <div className={styles.inlineNotice}>
              Чтобы менять порядок, выберите конкретную папку категории и очистите поиск, фильтры и выбор товаров.
            </div>
          ) : null}
        </main>
      </div>

      {editingProductId ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setEditingProductId(null)}>
          <div
            className={styles.modalPanelWide}
            role="dialog"
            aria-modal="true"
            aria-label="Редактирование товара"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Закрыть"
              onClick={() => setEditingProductId(null)}
            >
              ×
            </button>
            <ProductForm
              productId={editingProductId}
              mode="modal"
              onDone={() => setEditingProductId(null)}
              onCancel={() => setEditingProductId(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
