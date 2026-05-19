import { useState } from 'react'
import { apiRequest } from '@/lib/api'
import styles from '../admin.module.css'

type MediaMode = 'missing' | 'all'
type SourceMode = 'official' | 'mixed' | 'web'

type SearchCandidate = {
  image_url: string
  page_url: string
  title: string
  source_domain: string
  source_type: string
  score: number
}

type CategoryTarget = {
  id: string
  title: string
  slug: string
  parent_title?: string | null
  image_url?: string | null
}

type ProductImage = {
  id: string
  url: string
  sort: number
}

type ProductTarget = {
  id: string
  title: string
  slug: string
  sku?: string | null
  category_title: string
  image_count: number
  images: ProductImage[]
}

type CategorySearchItem = {
  target: CategoryTarget
  candidates: SearchCandidate[]
}

type ProductSearchItem = {
  target: ProductTarget
  candidates: SearchCandidate[]
}

type SearchResponse<T> = {
  message: string
  scope: 'categories' | 'products'
  mode: MediaMode
  source_mode: SourceMode
  results: T[]
}

function getErrorMessage(error: any) {
  const detail = error?.detail || error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }
  return String(error?.message || 'Не удалось выполнить поиск изображений')
}

function sourceModeLabel(value: SourceMode) {
  if (value === 'official') {
    return 'Только официальные сайты'
  }
  if (value === 'web') {
    return 'Поиск по всему интернету'
  }
  return 'Официальные сайты + веб'
}

export default function MediaImportPage() {
  const [categoryMode, setCategoryMode] = useState<MediaMode>('missing')
  const [categorySourceMode, setCategorySourceMode] = useState<SourceMode>('mixed')
  const [categoryLimit, setCategoryLimit] = useState('8')
  const [categoryCandidatesLimit, setCategoryCandidatesLimit] = useState('4')
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [categoryResults, setCategoryResults] = useState<CategorySearchItem[]>([])

  const [productMode, setProductMode] = useState<MediaMode>('missing')
  const [productSourceMode, setProductSourceMode] = useState<SourceMode>('mixed')
  const [productLimit, setProductLimit] = useState('8')
  const [productCandidatesLimit, setProductCandidatesLimit] = useState('4')
  const [publishedOnly, setPublishedOnly] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productError, setProductError] = useState('')
  const [productResults, setProductResults] = useState<ProductSearchItem[]>([])

  const [applyingKey, setApplyingKey] = useState('')

  const runCategories = async () => {
    setCategoriesLoading(true)
    setCategoryError('')

    try {
      const response = await apiRequest<SearchResponse<CategorySearchItem>>('/api/admin/media-search/categories', {
        method: 'POST',
        body: JSON.stringify({
          mode: categoryMode,
          source_mode: categorySourceMode,
          limit: Number(categoryLimit) || 8,
          candidates_limit: Number(categoryCandidatesLimit) || 4,
        }),
      })
      setCategoryResults(response.results)
    } catch (error: any) {
      setCategoryError(getErrorMessage(error))
    } finally {
      setCategoriesLoading(false)
    }
  }

  const runProducts = async () => {
    setProductsLoading(true)
    setProductError('')

    try {
      const response = await apiRequest<SearchResponse<ProductSearchItem>>('/api/admin/media-search/products', {
        method: 'POST',
        body: JSON.stringify({
          mode: productMode,
          source_mode: productSourceMode,
          limit: Number(productLimit) || 8,
          candidates_limit: Number(productCandidatesLimit) || 4,
          published_only: publishedOnly,
        }),
      })
      setProductResults(response.results)
    } catch (error: any) {
      setProductError(getErrorMessage(error))
    } finally {
      setProductsLoading(false)
    }
  }

  const applyCategoryCandidate = async (targetId: string, candidate: SearchCandidate) => {
    const key = `category:${targetId}:${candidate.image_url}`
    setApplyingKey(key)
    try {
      const response = await apiRequest<{ target: CategoryTarget }>(`/api/admin/media-search/categories/${targetId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ image_url: candidate.image_url }),
      })
      setCategoryResults((current) =>
        current.map((item) =>
          item.target.id === targetId
            ? { ...item, target: response.target }
            : item,
        ),
      )
    } catch (error: any) {
      alert(getErrorMessage(error))
    } finally {
      setApplyingKey('')
    }
  }

  const applyProductCandidate = async (targetId: string, candidate: SearchCandidate) => {
    const key = `product:${targetId}:${candidate.image_url}`
    setApplyingKey(key)
    try {
      const response = await apiRequest<{ target: ProductTarget }>(`/api/admin/media-search/products/${targetId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ image_url: candidate.image_url }),
      })
      setProductResults((current) =>
        current.map((item) =>
          item.target.id === targetId
            ? { ...item, target: response.target }
            : item,
        ),
      )
    } catch (error: any) {
      alert(getErrorMessage(error))
    } finally {
      setApplyingKey('')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Умный поиск фото</p>
          <h1 className={styles.title}>Фото для каталога и товаров</h1>
          <p className={styles.subtitle}>
            Страница ищет реальные изображения в официальных источниках и по вебу,
            показывает кандидатов и дает применить нужную картинку в базу без ручной загрузки файлов.
          </p>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Режим</div>
          <div className={styles.statValue}>Search</div>
          <div className={styles.statMeta}>Сначала поиск кандидатов, потом ручное применение.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Источники</div>
          <div className={styles.statValue}>Official + Web</div>
          <div className={styles.statMeta}>Boyard, Slotex, Kronospan, Egger, Makmart и веб-поиск.</div>
        </div>
      </div>

      <div className={styles.contentSplit}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Категории и подкатегории</h2>
              <p className={styles.cardText}>
                Ищет обложки разделов по названию, slug и контексту родительской категории.
              </p>
            </div>
          </div>

          <div className={styles.formGridCompact}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Режим</span>
              <select
                className={styles.select}
                value={categoryMode}
                onChange={(event) => setCategoryMode(event.target.value as MediaMode)}
                disabled={categoriesLoading}
              >
                <option value="missing">Только без фото</option>
                <option value="all">Обновить все</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Источники</span>
              <select
                className={styles.select}
                value={categorySourceMode}
                onChange={(event) => setCategorySourceMode(event.target.value as SourceMode)}
                disabled={categoriesLoading}
              >
                <option value="official">Только official</option>
                <option value="mixed">Official + web</option>
                <option value="web">Весь веб</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Лимит объектов</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="50"
                value={categoryLimit}
                onChange={(event) => setCategoryLimit(event.target.value)}
                disabled={categoriesLoading}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Кандидатов на объект</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="10"
                value={categoryCandidatesLimit}
                onChange={(event) => setCategoryCandidatesLimit(event.target.value)}
                disabled={categoriesLoading}
              />
            </label>
          </div>

          <div className={styles.actions} style={{ marginTop: 18 }}>
            <button className={styles.buttonPrimary} onClick={runCategories} disabled={categoriesLoading}>
              {categoriesLoading ? 'Ищем...' : 'Найти кандидатов'}
            </button>
            <span className={styles.fieldHint}>{sourceModeLabel(categorySourceMode)}</span>
          </div>

          {categoryError ? <div className={styles.errorNotice} style={{ marginTop: 18 }}>{categoryError}</div> : null}

          <div className={styles.formStack} style={{ marginTop: 18 }}>
            {categoryResults.map((item) => (
              <div key={item.target.id} className={styles.formSection}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>{item.target.title}</h3>
                    <p className={styles.sectionDescription}>
                      {item.target.parent_title ? `${item.target.parent_title} • ` : ''}
                      /{item.target.slug}
                    </p>
                  </div>
                  {item.target.image_url ? (
                    <img className={styles.previewImage} src={item.target.image_url} alt={item.target.title} style={{ width: 96, aspectRatio: '1 / 1', borderRadius: 18 }} />
                  ) : null}
                </div>

                {item.candidates.length === 0 ? (
                  <div className={styles.inlineNotice}>Кандидаты не найдены.</div>
                ) : (
                  <div className={styles.previewGrid}>
                    {item.candidates.map((candidate) => {
                      const applyKey = `category:${item.target.id}:${candidate.image_url}`
                      return (
                        <div key={applyKey} className={styles.previewCard}>
                          <img className={styles.previewImage} src={candidate.image_url} alt={candidate.title} />
                          <div className={styles.previewInfo}>
                            <strong>{candidate.source_domain}</strong>
                            <br />
                            {candidate.source_type} • score {candidate.score}
                          </div>
                          <div style={{ padding: '0 12px 12px', display: 'grid', gap: 8 }}>
                            <a href={candidate.page_url} target="_blank" rel="noreferrer" className={styles.buttonGhost}>
                              Источник
                            </a>
                            <button
                              type="button"
                              className={styles.buttonPrimary}
                              onClick={() => applyCategoryCandidate(item.target.id, candidate)}
                              disabled={applyingKey === applyKey}
                            >
                              {applyingKey === applyKey ? 'Применяю...' : 'Применить'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Товары</h2>
              <p className={styles.cardText}>
                Ищет реальные изображения по названию, SKU и категории. Лучше всего работает на товарах с кодом или артикулом.
              </p>
            </div>
          </div>

          <div className={styles.formGridCompact}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Режим</span>
              <select
                className={styles.select}
                value={productMode}
                onChange={(event) => setProductMode(event.target.value as MediaMode)}
                disabled={productsLoading}
              >
                <option value="missing">Только без фото</option>
                <option value="all">Обновить все</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Источники</span>
              <select
                className={styles.select}
                value={productSourceMode}
                onChange={(event) => setProductSourceMode(event.target.value as SourceMode)}
                disabled={productsLoading}
              >
                <option value="official">Только official</option>
                <option value="mixed">Official + web</option>
                <option value="web">Весь веб</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Лимит объектов</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="50"
                value={productLimit}
                onChange={(event) => setProductLimit(event.target.value)}
                disabled={productsLoading}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Кандидатов на объект</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="10"
                value={productCandidatesLimit}
                onChange={(event) => setProductCandidatesLimit(event.target.value)}
                disabled={productsLoading}
              />
            </label>
          </div>

          <label className={styles.fieldWide} style={{ marginTop: 18 }}>
            <span className={styles.fieldLabel}>Фильтр</span>
            <div className={styles.switchRow}>
              <input
                type="checkbox"
                checked={publishedOnly}
                onChange={(event) => setPublishedOnly(event.target.checked)}
                disabled={productsLoading}
              />
              <div className={styles.switchLabel}>
                <span className={styles.switchTitle}>Только опубликованные</span>
                <span className={styles.switchText}>Полезно для первой чистой волны подбора фотографий.</span>
              </div>
            </div>
          </label>

          <div className={styles.actions} style={{ marginTop: 18 }}>
            <button className={styles.buttonPrimary} onClick={runProducts} disabled={productsLoading}>
              {productsLoading ? 'Ищем...' : 'Найти кандидатов'}
            </button>
            <span className={styles.fieldHint}>{sourceModeLabel(productSourceMode)}</span>
          </div>

          {productError ? <div className={styles.errorNotice} style={{ marginTop: 18 }}>{productError}</div> : null}

          <div className={styles.formStack} style={{ marginTop: 18 }}>
            {productResults.map((item) => (
              <div key={item.target.id} className={styles.formSection}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>{item.target.title}</h3>
                    <p className={styles.sectionDescription}>
                      {item.target.category_title}
                      {item.target.sku ? ` • SKU: ${item.target.sku}` : ''}
                      {' • '}
                      {item.target.image_count ? `Текущих фото: ${item.target.image_count}` : 'Без фото'}
                    </p>
                  </div>
                </div>

                {item.target.images.length > 0 ? (
                  <div className={styles.previewGrid} style={{ marginBottom: 16 }}>
                    {item.target.images.slice(0, 4).map((image) => (
                      <div key={image.id} className={styles.previewCard}>
                        <img className={styles.previewImage} src={image.url} alt={item.target.title} />
                        <div className={styles.previewInfo}>Текущее фото #{image.sort + 1}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {item.candidates.length === 0 ? (
                  <div className={styles.inlineNotice}>Кандидаты не найдены.</div>
                ) : (
                  <div className={styles.previewGrid}>
                    {item.candidates.map((candidate) => {
                      const applyKey = `product:${item.target.id}:${candidate.image_url}`
                      return (
                        <div key={applyKey} className={styles.previewCard}>
                          <img className={styles.previewImage} src={candidate.image_url} alt={candidate.title} />
                          <div className={styles.previewInfo}>
                            <strong>{candidate.source_domain}</strong>
                            <br />
                            {candidate.source_type} • score {candidate.score}
                          </div>
                          <div style={{ padding: '0 12px 12px', display: 'grid', gap: 8 }}>
                            <a href={candidate.page_url} target="_blank" rel="noreferrer" className={styles.buttonGhost}>
                              Источник
                            </a>
                            <button
                              type="button"
                              className={styles.buttonPrimary}
                              onClick={() => applyProductCandidate(item.target.id, candidate)}
                              disabled={applyingKey === applyKey}
                            >
                              {applyingKey === applyKey ? 'Применяю...' : 'Применить'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
