import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '@/lib/api'
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
}

type BulkImageMode = 'keep' | 'replace' | 'clear'

function toFormValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? '' : String(value)
}

export default function ProductsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [imageFilter, setImageFilter] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<AdminProduct[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkImageMode, setBulkImageMode] = useState<BulkImageMode>('keep')
  const [bulkImageFiles, setBulkImageFiles] = useState<File[]>([])
  const [bulkImageInputKey, setBulkImageInputKey] = useState(0)
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

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
    setBulkImageInputKey((current) => current + 1)
  }, [selectedIds])

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return
    }
    if (!catFilter && rows[targetIndex].category_id !== rows[index].category_id) {
      return
    }
    setRows(arrayMove(rows, index, targetIndex))
  }

  const saveOrder = async () => {
    const pairs: Array<{ id: string; sort: number }> = []

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

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  )

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
    search.trim().length > 0 ||
    statusFilter.length > 0 ||
    imageFilter.length > 0 ||
    selectedIds.length > 0

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

  const buildProductUpdateFormData = (product: AdminProduct) => {
    const formData = new FormData()
    formData.set('title', product.title)
    formData.set('sku', product.sku || '')
    formData.set('category_id', product.category_id)
    formData.set('price', toFormValue(product.price))
    formData.set('size', product.size || '')
    formData.set('thickness', toFormValue(product.thickness))
    formData.set('color', product.color || '')
    formData.set('unit', product.unit || '')
    formData.set('material', product.material || '')
    formData.set('description', product.description || '')
    formData.set('is_published', product.is_published ? 'true' : 'false')

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

      {selectedRows.length > 0 ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Выбрано товаров: {selectedRows.length}</h2>
              <p className={styles.cardText}>
                Меняйте артикулы, цены и фотографии сразу у всей выборки. Одна пачка файлов
                будет применена ко всем выбранным товарам.
              </p>
            </div>

            <div className={styles.actions}>
              {selectedRows.length === 1 ? (
                <button
                  type="button"
                  className={styles.buttonSecondary}
                  onClick={() => navigate(`/admin/products/${selectedRows[0].id}`)}
                >
                  Открыть карточку
                </button>
              ) : null}
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={saveSelected}
                disabled={isBulkSaving || isBulkDeleting}
              >
                {isBulkSaving ? 'Сохраняю...' : 'Сохранить выбранные'}
              </button>
              <button
                type="button"
                className={styles.buttonDanger}
                onClick={deleteSelected}
                disabled={isBulkSaving || isBulkDeleting}
              >
                {isBulkDeleting ? 'Удаляю...' : 'Удалить выбранные'}
              </button>
              <button
                type="button"
                className={styles.buttonGhost}
                onClick={() => setSelectedIds([])}
                disabled={isBulkSaving || isBulkDeleting}
              >
                Снять выбор
              </button>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Массовые фото</h3>
            <p className={styles.sectionDescription}>
              Сейчас у выбранных товаров фотографий: <strong>{selectedImagesCount}</strong>.
              Можно оставить фото как есть, заменить их одинаковым набором изображений или очистить все.
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
                <span className={styles.fieldHint}>
                  Режим применяется сразу ко всем выбранным товарам.
                </span>
              </label>

              {bulkImageMode === 'replace' ? (
                <div className={styles.dropzone}>
                  <label className={styles.fieldWide}>
                    <span className={styles.fieldLabel}>Новые фото для всех выбранных товаров</span>
                    <input
                      key={bulkImageInputKey}
                      className={styles.input}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => handleBulkFilesSelected(event.target.files)}
                    />
                    <span className={styles.fieldHint}>
                      Выбранные файлы заменят текущую галерею у каждого товара из выборки.
                    </span>
                  </label>

                  {bulkImageFiles.length > 0 ? (
                    <>
                      <div className={styles.inlineNotice}>
                        Подготовлено файлов: <strong>{bulkImageFiles.length}</strong>
                      </div>
                      <div className={styles.previewGrid}>
                        {bulkImageFiles.map((file) => (
                          <div key={`${file.name}-${file.lastModified}`} className={styles.previewCard}>
                            <div className={styles.previewInfo}>
                              <strong>{file.name}</strong>
                              <br />
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.buttonGhost}
                          onClick={clearBulkFiles}
                          disabled={isBulkSaving || isBulkDeleting}
                        >
                          Очистить выбранные файлы
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {bulkImageMode === 'clear' ? (
                <div className={styles.inlineNotice}>
                  При сохранении у всех выбранных товаров будут удалены текущие изображения.
                </div>
              ) : null}
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

                <div className={styles.selectionFields}>
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
                        updateSelectedRow(product.id, {
                          price: nextValue === '' ? null : Number(nextValue),
                        })
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
                    onClick={() => navigate(`/admin/products/${product.id}`)}
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
        <div className={styles.emptyState}>По текущему фильтру товаров не найдено.</div>
      ) : null}

      {!q.isLoading && !q.isError && rows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
                </th>
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
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelected(product.id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <div className={styles.tableTitle}>
                      <span className={styles.tablePrimary}>{product.title}</span>
                      <span className={styles.tableSecondary}>
                        /{product.slug}
                        {product.sku ? ` • SKU: ${product.sku}` : ''}
                        {' • '}
                        {product.images?.length ? `Фото: ${product.images.length}` : 'Без фото'}
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
                      <Link to={`/admin/products/${product.id}`} className={styles.buttonSecondary}>
                        Редактировать
                      </Link>
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
          Перестановка временно отключена, пока включен поиск, фильтр или выбор товаров.
          Очистите их, чтобы менять порядок товаров.
        </div>
      ) : null}
    </div>
  )
}
