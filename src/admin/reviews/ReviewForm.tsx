import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import Images from '../../images'
import styles from '../admin.module.css'

type FormValues = {
  name: string
  city?: string
  role?: string
  body: string
  sort?: number | string
  is_published?: boolean
  remove_avatar?: boolean
  remove_image?: boolean
  avatar?: FileList
  image?: FileList
}

type ReviewResponse = {
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

export default function ReviewForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>()

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [avatarName, setAvatarName] = useState('')
  const [imageName, setImageName] = useState('')

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [avatarPreview, imagePreview])

  useEffect(() => {
    ;(async () => {
      if (!id) {
        setValue('is_published', true as never)
        setValue('role', 'Клиент' as never)
        setValue('sort', 0 as never)
        return
      }

      const review = await apiRequest<ReviewResponse>(`/api/admin/reviews/${id}`)
      setValue('name', review.name as never)
      setValue('city', (review.city || '') as never)
      setValue('role', (review.role || 'Клиент') as never)
      setValue('body', review.body as never)
      setValue('sort', review.sort as never)
      setValue('is_published', review.is_published as never)
      setExistingAvatar(review.avatar_url || null)
      setExistingImage(review.image_url || null)
    })().catch((requestError) => {
      setError((requestError as Error).message || 'Не удалось загрузить форму отзыва.')
    })
  }, [id, setValue])

  const handleAvatarSelected = (files: FileList | null | undefined) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)

    const file = files?.[0]
    setAvatarName(file?.name || '')
    setAvatarPreview(file ? URL.createObjectURL(file) : null)
    if (file) setValue('remove_avatar', false as never)
  }

  const handleImageSelected = (files: FileList | null | undefined) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)

    const file = files?.[0]
    setImageName(file?.name || '')
    setImagePreview(file ? URL.createObjectURL(file) : null)
    if (file) setValue('remove_image', false as never)
  }

  const avatarRegister = register('avatar', {
    onChange: (event) => handleAvatarSelected(event.target.files),
  })

  const imageRegister = register('image', {
    onChange: (event) => handleImageSelected(event.target.files),
  })

  const body = watch('body') || ''
  const name = watch('name') || ''
  const city = watch('city') || ''
  const role = watch('role') || 'Клиент'
  const isPublished = Boolean(watch('is_published'))
  const removeAvatar = Boolean(watch('remove_avatar'))
  const removeImage = Boolean(watch('remove_image'))

  const previewParagraphs = useMemo(
    () =>
      body
        .split(/\n\s*\n/g)
        .map((part) => part.trim())
        .filter(Boolean),
    [body],
  )

  const shownAvatar = !removeAvatar ? avatarPreview || existingAvatar || Images.nofoto : Images.nofoto
  const shownImage = !removeImage ? imagePreview || existingImage || '' : ''

  const onSubmit = async (values: FormValues) => {
    setError('')
    setNotice('')

    try {
      const formData = new FormData()
      formData.set('name', values.name)
      formData.set('city', values.city || '')
      formData.set('role', values.role || 'Клиент')
      formData.set('body', values.body)
      formData.set('sort', values.sort === undefined || values.sort === '' ? '0' : String(values.sort))
      formData.set('is_published', values.is_published ? 'true' : 'false')
      formData.set('remove_avatar', values.remove_avatar ? 'true' : 'false')
      formData.set('remove_image', values.remove_image ? 'true' : 'false')

      if (values.avatar?.[0]) formData.append('avatar', values.avatar[0])
      if (values.image?.[0]) formData.append('image', values.image[0])

      if (id) {
        await apiRequest(`/api/admin/reviews/${id}`, {
          method: 'PUT',
          body: formData,
        })
      } else {
        await apiRequest('/api/admin/reviews', {
          method: 'POST',
          body: formData,
        })
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['reviews-admin'] }),
        qc.invalidateQueries({ queryKey: ['reviews'] }),
      ])

      setNotice(id ? 'Отзыв обновлён.' : 'Отзыв добавлен.')
      nav('/admin/reviews')
    } catch (requestError: any) {
      setError(requestError?.message || 'Не удалось сохранить отзыв.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Отзывы</p>
          <h1 className={styles.title}>{id ? 'Редактирование отзыва' : 'Новый отзыв'}</h1>
          <p className={styles.subtitle}>
            Заполните имя, текст и изображения. После сохранения отзыв появится в
            админке, а при публикации будет показан на главной странице.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.buttonGhost} onClick={() => nav('/admin/reviews')}>
            Назад к списку
          </button>
        </div>
      </div>

      {error ? <div className={styles.errorNotice}>{error}</div> : null}
      {notice ? <div className={styles.successNotice}>{notice}</div> : null}

      <div className={styles.contentSplit}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formStack}>
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Основная информация</h2>
            <p className={styles.sectionDescription}>
              Эти данные будут видны рядом с текстом отзыва.
            </p>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Имя</span>
                <input className={styles.input} placeholder="Например: Туйаара Пермякова" {...register('name', { required: true })} />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Город</span>
                <input className={styles.input} placeholder="Якутск" {...register('city')} />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Подпись</span>
                <input className={styles.input} placeholder="Клиент" {...register('role')} />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Порядок</span>
                <input className={styles.input} type="number" step="1" placeholder="0" {...register('sort')} />
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Текст отзыва</h2>
            <p className={styles.sectionDescription}>
              Разделяйте абзацы пустой строкой. Так они красиво разложатся на сайте.
            </p>

            <label className={styles.fieldWide}>
              <span className={styles.fieldLabel}>Содержимое</span>
              <textarea
                className={styles.textarea}
                placeholder="Опишите впечатление клиента, результат и что особенно понравилось."
                {...register('body', { required: true })}
              />
            </label>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Изображения</h2>
            <p className={styles.sectionDescription}>
              Можно загрузить отдельный аватар клиента и основную фотографию проекта.
            </p>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Аватар</span>
                <input className={styles.input} type="file" accept="image/*" {...avatarRegister} />
                <span className={styles.fieldHint}>{avatarName || 'Один файл, лучше квадратный.'}</span>
                <label className={styles.switchRow}>
                  <input type="checkbox" {...register('remove_avatar')} />
                  <div className={styles.switchLabel}>
                    <span className={styles.switchTitle}>Удалить текущий аватар</span>
                    <span className={styles.switchText}>Используйте, если хотите оставить только заглушку.</span>
                  </div>
                </label>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Фото проекта</span>
                <input className={styles.input} type="file" accept="image/*" {...imageRegister} />
                <span className={styles.fieldHint}>{imageName || 'Один широкий кадр для карточки отзыва.'}</span>
                <label className={styles.switchRow}>
                  <input type="checkbox" {...register('remove_image')} />
                  <div className={styles.switchLabel}>
                    <span className={styles.switchTitle}>Удалить фото проекта</span>
                    <span className={styles.switchText}>Блок всё равно останется аккуратным без изображения.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.previewGrid}>
              <div className={styles.previewCard}>
                <img className={styles.previewImage} src={shownAvatar} alt="avatar-preview" />
                <div className={styles.previewInfo}>Аватар</div>
              </div>
              <div className={styles.previewCard}>
                {shownImage ? (
                  <img className={styles.previewImage} src={shownImage} alt="review-preview" />
                ) : (
                  <div className={styles.previewImage} />
                )}
                <div className={styles.previewInfo}>Фото проекта</div>
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Публикация</h2>
            <label className={styles.switchRow}>
              <input type="checkbox" {...register('is_published')} />
              <div className={styles.switchLabel}>
                <span className={styles.switchTitle}>Показывать отзыв на сайте</span>
                <span className={styles.switchText}>
                  Если выключить, отзыв останется в админке, но не будет виден посетителям.
                </span>
              </div>
            </label>
          </section>

          <div className={styles.actions}>
            <button className={styles.buttonPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняю...' : id ? 'Сохранить изменения' : 'Создать отзыв'}
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => nav('/admin/reviews')}
              disabled={isSubmitting}
            >
              Отмена
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <div className={styles.summaryPreview}>
            <p className={styles.eyebrow}>Предпросмотр</p>
            <h2 className={styles.summaryTitle}>{name || 'Имя клиента'}</h2>
            <p className={styles.summaryText}>
              {[role || 'Клиент', city].filter(Boolean).join(', ') || 'Подпись к отзыву'}
            </p>

            <div className={styles.summaryMeta}>
              <span className={isPublished ? styles.statusCompleted : styles.statusCancelled}>
                {isPublished ? 'Опубликован' : 'Скрыт'}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Как это будет выглядеть</h3>
                <p className={styles.cardText}>Текст автоматически разобьётся на абзацы.</p>
              </div>
            </div>

            <div className={styles.formStack}>
              {previewParagraphs.length ? (
                previewParagraphs.map((paragraph) => (
                  <div key={paragraph} className={styles.inlineNotice}>
                    {paragraph}
                  </div>
                ))
              ) : (
                <div className={styles.inlineNotice}>
                  Добавьте текст отзыва, чтобы увидеть превью абзацев.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
