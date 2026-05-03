import { useState } from 'react'
import { apiRequest } from '@/lib/api'
import styles from '../admin.module.css'

type MediaImportMode = 'missing' | 'all'

type MediaImportStats = {
  scope: 'categories' | 'products'
  mode: MediaImportMode
  limit: number
  published_only?: boolean
  processed: number
  updated: number
  not_found: number
  download_failures: number
  unchanged: number
  updated_titles: string[]
}

type MediaImportResponse = {
  message: string
  stats: MediaImportStats
}

function modeLabel(mode: MediaImportMode) {
  return mode === 'missing' ? 'только без фото' : 'обновить все'
}

function formatStats(stats: MediaImportStats) {
  const lines = [
    `Режим: ${modeLabel(stats.mode)}`,
    `Обработано: ${stats.processed}`,
    `Обновлено: ${stats.updated}`,
    `Не найдено: ${stats.not_found}`,
    `Ошибки скачивания: ${stats.download_failures}`,
  ]

  if (stats.scope === 'products') {
    lines.push(`Только опубликованные: ${stats.published_only ? 'да' : 'нет'}`)
  }

  if (stats.unchanged > 0) {
    lines.push(`Без изменений: ${stats.unchanged}`)
  }

  if (stats.updated_titles.length > 0) {
    lines.push('')
    lines.push('Обновлены:')
    lines.push(...stats.updated_titles.slice(0, 12).map((title) => `• ${title}`))
    if (stats.updated_titles.length > 12) {
      lines.push(`• и еще ${stats.updated_titles.length - 12}`)
    }
  }

  return lines.join('\n')
}

function getErrorMessage(error: any) {
  const detail = error?.detail || error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }
  return String(error?.message || 'Не удалось выполнить автопарсинг')
}

export default function MediaImportPage() {
  const [categoryMode, setCategoryMode] = useState<MediaImportMode>('missing')
  const [categoryLimit, setCategoryLimit] = useState('25')
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoryResult, setCategoryResult] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const [productMode, setProductMode] = useState<MediaImportMode>('missing')
  const [productLimit, setProductLimit] = useState('20')
  const [publishedOnly, setPublishedOnly] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productResult, setProductResult] = useState('')
  const [productError, setProductError] = useState('')

  const runCategories = async () => {
    setCategoriesLoading(true)
    setCategoryResult('')
    setCategoryError('')

    try {
      const response = await apiRequest<MediaImportResponse>('/api/admin/media-import/categories', {
        method: 'POST',
        body: JSON.stringify({
          mode: categoryMode,
          limit: Number(categoryLimit) || 25,
        }),
      })
      setCategoryResult(formatStats(response.stats))
    } catch (error: any) {
      setCategoryError(getErrorMessage(error))
    } finally {
      setCategoriesLoading(false)
    }
  }

  const runProducts = async () => {
    setProductsLoading(true)
    setProductResult('')
    setProductError('')

    try {
      const response = await apiRequest<MediaImportResponse>('/api/admin/media-import/products', {
        method: 'POST',
        body: JSON.stringify({
          mode: productMode,
          limit: Number(productLimit) || 20,
          published_only: publishedOnly,
        }),
      })
      setProductResult(formatStats(response.stats))
    } catch (error: any) {
      setProductError(getErrorMessage(error))
    } finally {
      setProductsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Автопарсинг фото</p>
          <h1 className={styles.title}>Фото из сайтов</h1>
          <p className={styles.subtitle}>
            Этот инструмент ищет изображения напрямую на сайтах-источниках и сохраняет их в ваш backend.
            Excel здесь не используется: берутся уже существующие категории и товары из базы.
          </p>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Источники</div>
          <div className={styles.statValue}>3</div>
          <div className={styles.statMeta}>BOYARD, Slotex и Kronospan для категорий и товаров.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Рекомендованный батч</div>
          <div className={styles.statValue}>20–25</div>
          <div className={styles.statMeta}>Так ниже шанс снова упереться в долгий внешний ответ.</div>
        </div>
      </div>

      <div className={styles.contentSplit}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Категории и подкатегории</h2>
              <p className={styles.cardText}>
                Подтягивает обложки разделов по названию и slug. Подходит для столешниц, ЛДСП, фасадов и фурнитуры.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Режим</span>
              <select
                className={styles.select}
                value={categoryMode}
                onChange={(event) => setCategoryMode(event.target.value as MediaImportMode)}
                disabled={categoriesLoading}
              >
                <option value="missing">Только без фото</option>
                <option value="all">Обновить все</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Лимит за запуск</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="200"
                value={categoryLimit}
                onChange={(event) => setCategoryLimit(event.target.value)}
                disabled={categoriesLoading}
              />
            </label>
          </div>

          <div className={styles.actions} style={{ marginTop: 18 }}>
            <button className={styles.buttonPrimary} onClick={runCategories} disabled={categoriesLoading}>
              {categoriesLoading ? 'Ищем фото...' : 'Запустить для категорий'}
            </button>
          </div>

          {categoryResult ? (
            <div className={styles.successNotice} style={{ whiteSpace: 'pre-line', marginTop: 18 }}>
              {categoryResult}
            </div>
          ) : null}
          {categoryError ? <div className={styles.errorNotice} style={{ marginTop: 18 }}>{categoryError}</div> : null}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Товары</h2>
              <p className={styles.cardText}>
                Ищет изображения карточек по названию, SKU и контексту категории. Лучше всего работает на фурнитуре и декорах с кодами.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Режим</span>
              <select
                className={styles.select}
                value={productMode}
                onChange={(event) => setProductMode(event.target.value as MediaImportMode)}
                disabled={productsLoading}
              >
                <option value="missing">Только без фото</option>
                <option value="all">Обновить все</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Лимит за запуск</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="200"
                value={productLimit}
                onChange={(event) => setProductLimit(event.target.value)}
                disabled={productsLoading}
              />
            </label>

            <label className={styles.fieldWide}>
              <span className={styles.fieldLabel}>Фильтр</span>
              <div className={styles.switchRow}>
                <input
                  type="checkbox"
                  checked={publishedOnly}
                  onChange={(event) => setPublishedOnly(event.target.checked)}
                  disabled={productsLoading}
                />
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>Только опубликованные товары</span>
                  <span className={styles.switchText}>Полезно для первого прохода по живому каталогу.</span>
                </div>
              </div>
            </label>
          </div>

          <div className={styles.actions} style={{ marginTop: 18 }}>
            <button className={styles.buttonPrimary} onClick={runProducts} disabled={productsLoading}>
              {productsLoading ? 'Ищем фото...' : 'Запустить для товаров'}
            </button>
          </div>

          {productResult ? (
            <div className={styles.successNotice} style={{ whiteSpace: 'pre-line', marginTop: 18 }}>
              {productResult}
            </div>
          ) : null}
          {productError ? <div className={styles.errorNotice} style={{ marginTop: 18 }}>{productError}</div> : null}
        </section>
      </div>
    </div>
  )
}
