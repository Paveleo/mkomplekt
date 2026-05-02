import { useState } from 'react'
import { apiRequest } from '@/lib/api'
import styles from '../admin.module.css'

type ImportStats = {
  mode: 'flat' | 'catalog'
  categories_created: number
  products_created: number
  products_updated: number
  products_skipped: number
}

type ImportResponse = {
  message: string
  stats?: ImportStats
}

function getImportErrorMessage(error: any) {
  const detail = error?.detail || error?.response?.data?.detail
  const backendError = error?.response?.data?.error

  if (detail === 'INVALID_FILE_FORMAT') {
    return 'Нужен файл Excel в формате .xlsx'
  }

  if (detail === 'INVALID_EXCEL_FILE') {
    return 'Файл Excel не удалось прочитать. Проверьте, что это корректный .xlsx'
  }

  if (detail === 'INVALID_EXCEL_STRUCTURE') {
    return 'Структура Excel не распознана. Поддерживаются табличный шаблон и иерархический каталог.'
  }

  if (detail === 'EMPTY_IMPORT_FILE') {
    return 'В файле не найдено данных для импорта.'
  }

  if (detail === 'IMPORT_FAILED') {
    return backendError
      ? `Импорт оборвался на сервере: ${backendError}`
      : 'Импорт оборвался на сервере. Проверьте логи backend.'
  }

  const message = String(error?.message || '')
  const normalized = message.trim().toLowerCase()
  if (normalized.startsWith('<!doctype html') || normalized.startsWith('<html')) {
    return 'Backend вернул HTML-ошибку вместо JSON. Обычно это значит, что контейнер api не пересобран после изменений.'
  }

  return message || 'Ошибка импорта'
}

function formatImportResult(fileName: string, stats?: ImportStats) {
  if (!stats) {
    return `Импорт завершён: ${fileName}`
  }

  const modeLabel =
    stats.mode === 'catalog' ? 'иерархический каталог' : 'табличный шаблон'

  return [
    `Импорт завершён: ${fileName}`,
    `Режим: ${modeLabel}`,
    `Создано категорий: ${stats.categories_created}`,
    `Создано товаров: ${stats.products_created}`,
    `Обновлено товаров: ${stats.products_updated}`,
    `Пропущено строк: ${stats.products_skipped}`,
  ].join('\n')
}

export default function ImportPage() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const onFile = async (file: File) => {
    const formData = new FormData()
    formData.set('file', file)

    setUploading(true)
    setResult('')
    setError('')

    try {
      const response = await apiRequest<ImportResponse>('/api/admin/import/products', {
        method: 'POST',
        body: formData,
      })
      setResult(formatImportResult(file.name, response?.stats))
    } catch (requestError: any) {
      setError(getImportErrorMessage(requestError))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Массовая загрузка</p>
          <h1 className={styles.title}>Импорт Excel</h1>
          <p className={styles.subtitle}>
            Импорт поддерживает два режима: обычную таблицу с колонками и иерархический каталог вроде
            файла «Номенклатура для сайта.xlsx».
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Что можно загружать</h2>
            <p className={styles.cardText}>
              1. Табличный Excel с колонками title, sku, category_slug, price, thickness, color, material,
              description, is_published, image1, image2, image3.
            </p>
            <p className={styles.cardText}>
              2. Иерархический каталог с листами, подкатегориями и товарами по отступам. Для него категории
              и товары создаются автоматически.
            </p>
          </div>
        </div>

        <div className={styles.dropzone}>
          <label className={styles.fieldWide}>
            <span className={styles.fieldLabel}>Excel файл</span>
            <input
              className={styles.input}
              type="file"
              accept=".xlsx"
              onChange={(event) => event.target.files && onFile(event.target.files[0])}
              disabled={uploading}
            />
            <span className={styles.fieldHint}>
              Загружайте один `.xlsx` за раз. Если это иерархический файл, backend сам разберёт листы,
              отступы и создаст дерево каталога.
            </span>
          </label>

          {uploading ? <div className={styles.inlineNotice}>Импорт выполняется...</div> : null}
          {result ? (
            <div className={styles.successNotice} style={{ whiteSpace: 'pre-line' }}>
              {result}
            </div>
          ) : null}
          {error ? <div className={styles.errorNotice}>{error}</div> : null}
        </div>
      </div>
    </div>
  )
}
