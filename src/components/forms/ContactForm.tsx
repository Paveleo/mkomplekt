import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { apiRequest } from '@/lib/api'
import styles from './ContactForm.module.css'

type ContactFormValues = {
  name: string
  email: string
  phone: string
  message: string
}

type SubmitState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null

function mapRequestError(error: unknown) {
  const detail =
    error && typeof error === 'object' && 'detail' in error
      ? String((error as { detail?: string }).detail || '')
      : ''

  if (detail === 'EMAIL_OR_PHONE_REQUIRED') {
    return 'Укажите телефон или email, чтобы менеджер мог с вами связаться.'
  }

  if (detail === 'NAME_REQUIRED') {
    return 'Введите имя, чтобы менеджер понимал, как к вам обращаться.'
  }

  if (detail === 'INVALID_ATTACHMENT_TYPE') {
    return 'Можно прикрепить только фотографию.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Не удалось отправить заявку. Попробуйте ещё раз.'
}

export default function ContactForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleAttachmentChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setAttachment(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const clearAttachment = () => {
    handleAttachmentChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitState(null)

    try {
      const formData = new FormData()
      formData.set('name', data.name)
      formData.set('email', data.email || '')
      formData.set('phone', data.phone || '')
      formData.set('message', data.message || '')

      if (attachment) {
        formData.set('attachment', attachment)
      }

      await apiRequest('/api/contact-requests', {
        method: 'POST',
        body: formData,
      })

      reset()
      clearAttachment()
      setSubmitState({
        type: 'success',
        message: 'Заявка отправлена. Менеджер увидит её в админке и свяжется с вами.',
      })
    } catch (error) {
      setSubmitState({
        type: 'error',
        message: mapRequestError(error),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <input
          className={styles.input}
          placeholder="Ваше имя"
          {...register('name', { required: 'Введите имя' })}
        />
        {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <input
            className={styles.input}
            placeholder="Email"
            type="email"
            {...register('email', {
              validate: (value) => {
                if (value?.trim() || getValues('phone')?.trim()) {
                  return true
                }
                return 'Укажите email или телефон'
              },
            })}
          />
          {errors.email ? <span className={styles.error}>{errors.email.message}</span> : null}
        </div>

        <div className={styles.field}>
          <input
            className={styles.input}
            placeholder="Телефон"
            {...register('phone', {
              validate: (value) => {
                if (value?.trim() || getValues('email')?.trim()) {
                  return true
                }
                return 'Укажите телефон или email'
              },
            })}
          />
          {errors.phone ? <span className={styles.error}>{errors.phone.message}</span> : null}
        </div>
      </div>

      <div className={styles.field}>
        <textarea
          className={styles.textarea}
          placeholder="Комментарий по проекту, материалам или задаче"
          rows={6}
          {...register('message')}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.uploadBox}>
          <div className={styles.uploadHeader}>
            <div>
              <div className={styles.uploadTitle}>Фотография к заявке</div>
              <div className={styles.uploadText}>
                Можно приложить одно фото проекта, помещения, образца или нужной позиции.
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(event) => handleAttachmentChange(event.target.files?.[0] || null)}
          />

          {attachment ? (
            <div className={styles.uploadPreview}>
              {previewUrl ? <img src={previewUrl} alt="attachment-preview" className={styles.previewImage} /> : null}
              <div className={styles.previewMeta}>
                <div className={styles.previewName}>{attachment.name}</div>
                <div className={styles.previewSize}>
                  {(attachment.size / 1024 / 1024).toFixed(2)} МБ
                </div>
              </div>
              <button type="button" className={styles.clearButton} onClick={clearAttachment}>
                Убрать фото
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.helper}>
          После отправки заявка автоматически появится в админке в разделе «Заявки».
        </p>
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? 'Отправляем...' : 'Оставить заявку'}
        </button>
      </div>

      {submitState ? (
        <div className={submitState.type === 'success' ? styles.success : styles.errorNotice}>
          {submitState.message}
        </div>
      ) : null}
    </form>
  )
}
