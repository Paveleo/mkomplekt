import { useEffect, useMemo, useState } from 'react'
import { useReviews } from '@/hooks/useReviews'
import s from './Reviews.module.css'

export default function Reviews() {
  const { data } = useReviews()
  const items = data || []

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((value) => (items.length ? Math.min(value, items.length - 1) : 0))
  }, [items.length])

  const current = items[index] || null
  const displayName = current?.name?.trim() || 'Клиент'
  const displayInitial = displayName.charAt(0).toUpperCase()
  const paragraphs = current?.text?.length ? current.text : ['Отзыв скоро появится.']
  const progress = useMemo(
    () => (items.length ? `${((index + 1) / items.length) * 100}%` : '0%'),
    [index, items.length],
  )

  const prev = () => setIndex((value) => (value - 1 + items.length) % items.length)
  const next = () => setIndex((value) => (value + 1) % items.length)

  useEffect(() => {
    if (!items.length) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') prev()
      if (event.key === 'ArrowRight') next()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length])

  if (!current) {
    return null
  }

  return (
    <section className={s.wrap}>
      <div className={s.heading}>
        <p className={s.eyebrow}>Отзывы</p>
        <h2 className={s.title}>Отзывы наших клиентов</h2>
        <p className={s.subtitle}>
          Реальные впечатления о материалах, сервисе и результате. Без шаблонных фраз,
          только опыт людей, которые уже собрали свой интерьер вместе с нами.
        </p>
      </div>

      <div className={s.panel}>
        <div className={s.mediaCard}>
          <div className={s.author}>
            {current.avatar_url ? (
              <img className={s.avatar} src={current.avatar_url} alt={displayName} />
            ) : (
              <div className={s.avatarPlaceholder} aria-hidden="true">
                {displayInitial}
              </div>
            )}

            <div className={s.authorInfo}>
              <div className={s.name}>{displayName}</div>
              <div className={s.meta}>
                {[current.role || 'Клиент', current.city].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>

          {current.image_url ? (
            <div className={s.photo}>
              <img src={current.image_url} alt={displayName} />
            </div>
          ) : (
            <div className={s.photoPlaceholder}>
              <span>Фото проекта</span>
            </div>
          )}
        </div>

        <article className={s.quoteCard}>
          <div className={s.quoteMark} aria-hidden="true">
            “
          </div>

          <div className={s.text}>
            {paragraphs.map((paragraph) => (
              <p className={s.paragraph} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={s.footer}>
            <div className={s.progressBlock}>
              <div className={s.counter}>
                <span className={s.counterCurrent}>{index + 1}</span>
                <span className={s.counterDivider}>/</span>
                <span className={s.counterTotal}>{items.length}</span>
              </div>
              <div className={s.progressTrack}>
                <span className={s.progressFill} style={{ width: progress }} />
              </div>
            </div>

            <div className={s.controls}>
              <button type="button" className={s.navBtn} onClick={prev} aria-label="Предыдущий отзыв">
                ←
              </button>
              <button type="button" className={s.navBtn} onClick={next} aria-label="Следующий отзыв">
                →
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
