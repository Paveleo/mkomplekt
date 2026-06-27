import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { arrayMove } from '@/utils/arrayMove'
import styles from '../admin.module.css'

type AdminWork = {
  id: string
  title: string
  caption: string
  image_url: string
  raw_image_url?: string
  source_url?: string
  is_published: boolean
  sort: number
}

type WorkForm = {
  id?: string
  title: string
  caption: string
  image_url: string
  source_url: string
  is_published: boolean
}

type InstagramImportResponse = {
  message: string
  stats: {
    fetched: number
    created: number
    updated: number
  }
}

const emptyForm: WorkForm = {
  title: '',
  caption: '',
  image_url: '',
  source_url: '',
  is_published: true,
}

function getErrorMessage(error: any) {
  const detail = error?.detail || error?.message
  if (detail === 'INSTAGRAM_MEDIA_NOT_FOUND') {
    return 'Instagram не отдал фото по этой ссылке. Попробуйте ссылку на конкретный пост или добавьте работу вручную.'
  }
  if (detail === 'ONLY_INSTAGRAM_URL_ALLOWED') {
    return 'Для автопарсинга нужна ссылка Instagram.'
  }
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }
  return 'Запрос не выполнен.'
}

export default function WorksAdminPage() {
  const qc = useQueryClient()
  const [rows, setRows] = useState<AdminWork[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<WorkForm>(emptyForm)
  const [instagramUrl, setInstagramUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const query = useQuery({
    queryKey: ['works-admin'],
    queryFn: async () => apiRequest<AdminWork[]>('/api/admin/works'),
  })

  useEffect(() => {
    if (query.data) {
      setRows(query.data)
    }
  }, [query.data])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) {
      return rows
    }
    return rows.filter((row) =>
      [row.title, row.caption || '', row.source_url || ''].some((value) =>
        value.toLowerCase().includes(q),
      ),
    )
  }, [rows, search])

  const isReorderLocked = search.trim().length > 0

  const resetForm = () => {
    setForm(emptyForm)
    setError('')
    setNotice('')
  }

  const editWork = (work: AdminWork) => {
    setForm({
      id: work.id,
      title: work.title,
      caption: work.caption || '',
      image_url: work.raw_image_url || work.image_url || '',
      source_url: work.source_url || '',
      is_published: work.is_published,
    })
    setError('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveWork = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      setError('Название и ссылка на фото обязательны.')
      return
    }

    setIsSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        title: form.title.trim(),
        caption: form.caption.trim(),
        image_url: form.image_url.trim(),
        source_url: form.source_url.trim(),
        is_published: form.is_published,
      }
      const saved = await apiRequest<AdminWork>(
        form.id ? `/api/admin/works/${form.id}` : '/api/admin/works',
        {
          method: form.id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      )

      setRows((current) => {
        if (form.id) {
          return current.map((row) => (row.id === saved.id ? saved : row))
        }
        return [saved, ...current]
      })

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['works-admin'] }),
        qc.invalidateQueries({ queryKey: ['works'] }),
      ])
      setNotice(form.id ? 'Работа обновлена.' : 'Работа добавлена.')
      setForm(emptyForm)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const deleteWork = async (work: AdminWork) => {
    if (!confirm(`Удалить работу "${work.title}"?`)) {
      return
    }

    try {
      await apiRequest(`/api/admin/works/${work.id}`, { method: 'DELETE' })
      setRows((current) => current.filter((row) => row.id !== work.id))
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['works-admin'] }),
        qc.invalidateQueries({ queryKey: ['works'] }),
      ])
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const togglePublished = async (work: AdminWork) => {
    try {
      const saved = await apiRequest<AdminWork>(`/api/admin/works/${work.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: work.title,
          caption: work.caption || '',
          image_url: work.raw_image_url || work.image_url,
          source_url: work.source_url || '',
          is_published: !work.is_published,
          sort: work.sort,
        }),
      })
      setRows((current) => current.map((row) => (row.id === saved.id ? saved : row)))
      await qc.invalidateQueries({ queryKey: ['works'] })
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return
    }
    setRows(arrayMove(rows, index, targetIndex))
  }

  const saveOrder = async () => {
    try {
      await apiRequest('/api/admin/works/order', {
        method: 'PUT',
        body: JSON.stringify(rows.map((row, index) => ({ id: row.id, sort: index }))),
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['works-admin'] }),
        qc.invalidateQueries({ queryKey: ['works'] }),
      ])
      setNotice('Порядок сохранен.')
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const importInstagram = async () => {
    const sourceUrl = instagramUrl.trim()
    if (!sourceUrl) {
      setError('Укажите ссылку на Instagram-профиль или конкретный пост.')
      return
    }

    setIsImporting(true)
    setError('')
    setNotice('')

    try {
      const result = await apiRequest<InstagramImportResponse>('/api/admin/works/import-instagram', {
        method: 'POST',
        body: JSON.stringify({ source_url: sourceUrl, limit: 12 }),
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['works-admin'] }),
        qc.invalidateQueries({ queryKey: ['works'] }),
      ])
      setNotice(
        `Импорт: найдено ${result.stats.fetched}, добавлено ${result.stats.created}, обновлено ${result.stats.updated}.`,
      )
      setInstagramUrl('')
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Портфолио</p>
          <h1 className={styles.title}>Наши работы</h1>
          <p className={styles.subtitle}>
            Управляйте карточками работ на сайте. Instagram-парсинг работает как быстрый импорт,
            но итоговые карточки всегда сохраняются в базе и редактируются вручную.
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
          <div className={styles.statLabel}>Всего</div>
          <div className={styles.statValue}>{rows.length}</div>
          <div className={styles.statMeta}>Карточек в базе.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Опубликованы</div>
          <div className={styles.statValue}>{rows.filter((row) => row.is_published).length}</div>
          <div className={styles.statMeta}>Видны посетителям.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Скрыты</div>
          <div className={styles.statValue}>{rows.filter((row) => !row.is_published).length}</div>
          <div className={styles.statMeta}>Черновики и отключенные работы.</div>
        </div>
      </div>

      {error ? <div className={styles.errorNotice}>{error}</div> : null}
      {notice ? <div className={styles.successNotice}>{notice}</div> : null}

      <div className={styles.contentSplit}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>{form.id ? 'Редактировать работу' : 'Добавить работу'}</h2>
              <p className={styles.cardText}>Можно вставить прямую ссылку на фото или ссылку на источник.</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Название</span>
              <input
                className={styles.input}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Ссылка на фото</span>
              <input
                className={styles.input}
                value={form.image_url}
                onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                placeholder="https://..."
              />
            </label>
            <label className={styles.fieldWide}>
              <span className={styles.fieldLabel}>Описание</span>
              <textarea
                className={styles.textarea}
                value={form.caption}
                onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
              />
            </label>
            <label className={styles.fieldWide}>
              <span className={styles.fieldLabel}>Ссылка на источник</span>
              <input
                className={styles.input}
                value={form.source_url}
                onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))}
                placeholder="https://www.instagram.com/p/..."
              />
            </label>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))}
              />
              <span className={styles.switchLabel}>
                <span className={styles.switchTitle}>Опубликовать</span>
                <span className={styles.switchText}>Карточка будет видна на странице “Наши работы”.</span>
              </span>
            </label>
          </div>

          <div className={styles.actions}>
            <button className={styles.buttonPrimary} onClick={saveWork} disabled={isSaving}>
              {isSaving ? 'Сохраняю...' : form.id ? 'Сохранить' : 'Добавить'}
            </button>
            {form.id ? (
              <button className={styles.buttonGhost} onClick={resetForm}>
                Отменить
              </button>
            ) : null}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Импорт из Instagram</h2>
              <p className={styles.cardText}>Вставьте ссылку на профиль, пост или reel. Если Instagram не отдаст HTML, добавьте работу вручную.</p>
            </div>
          </div>
          <div className={styles.formStack}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Instagram URL</span>
              <input
                className={styles.input}
                value={instagramUrl}
                onChange={(event) => setInstagramUrl(event.target.value)}
                placeholder="https://www.instagram.com/..."
              />
            </label>
            <button className={styles.buttonPrimary} onClick={importInstagram} disabled={isImporting}>
              {isImporting ? 'Пробую подтянуть...' : 'Попробовать парсинг'}
            </button>
          </div>
        </section>
      </div>

      <div className={styles.card}>
        <input
          className={styles.input}
          placeholder="Поиск по названию, описанию или ссылке"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {query.isLoading ? <div className={styles.inlineNotice}>Загрузка работ...</div> : null}
      {query.isError ? <div className={styles.errorNotice}>Не удалось загрузить работы.</div> : null}
      {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
        <div className={styles.emptyState}>Работы не найдены.</div>
      ) : null}

      {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Работа</th>
                <th>Статус</th>
                <th>Порядок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((work, index) => {
                const rowIndex = rows.findIndex((row) => row.id === work.id)
                return (
                  <tr key={work.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.workCell}>
                        {work.image_url ? <img src={work.image_url} alt={work.title} /> : null}
                        <div className={styles.tableTitle}>
                          <span className={styles.tablePrimary}>{work.title}</span>
                          <span className={styles.tableSecondary}>{work.source_url || 'Без источника'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${work.is_published ? styles.statusCompleted : styles.statusCancelled} ${styles.statusButton}`}
                        onClick={() => togglePublished(work)}
                      >
                        {work.is_published ? 'Опубликован' : 'Скрыт'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.toolbarGroup}>
                        <button className={styles.iconButton} onClick={() => move(rowIndex, -1)} disabled={rowIndex === 0 || isReorderLocked}>
                          ↑
                        </button>
                        <button className={styles.iconButton} onClick={() => move(rowIndex, 1)} disabled={rowIndex === rows.length - 1 || isReorderLocked}>
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={styles.buttonSecondary} onClick={() => editWork(work)}>
                          Редактировать
                        </button>
                        <button className={styles.buttonDanger} onClick={() => deleteWork(work)}>
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
    </div>
  )
}
