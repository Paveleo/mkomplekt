import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type WorkItem, useWorks } from '@/hooks/useWorks'
import s from './WorksPage.module.css'

function trimText(value: string, fallback: string) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) {
    return fallback
  }
  return text.length > 170 ? `${text.slice(0, 170).trim()}...` : text
}

export default function WorksPage() {
  const { data = [], isLoading, isError } = useWorks()
  const [activeWork, setActiveWork] = useState<WorkItem | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<WorkItem | null>(null)

  useEffect(() => {
    if (!activeWork && !fullscreenImage) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (fullscreenImage) {
          setFullscreenImage(null)
          return
        }
        setActiveWork(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeWork, fullscreenImage])

  return (
    <section className={s.wrap}>
      <div className={s.hero}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>Наши работы</p>
          <h1 className={s.title}>Готовые проекты и реальные материалы</h1>
          <p className={s.subtitle}>
            Собираем здесь выполненные проекты, идеи для интерьера, фасады, столешницы и комплектующие,
            которые уже можно показать клиентам как живой пример работы.
          </p>
        </div>

        <div className={s.heroCard}>
          <span className={s.cardLabel}>Портфолио</span>
          <p className={s.cardText}>
            Раздел обновляется из админки. Можно добавлять работы вручную или подтягивать фото из Instagram
            и публиковать только проверенные карточки.
          </p>
          <Link className={s.heroLink} to="/contacts">
            Обсудить проект
          </Link>
        </div>
      </div>

      <div className={s.actions}>
        <Link to="/catalog" className={s.actionPrimary}>Перейти в каталог</Link>
        <Link to="/contacts" className={s.actionSecondary}>Заказать расчет</Link>
      </div>

      <div className={s.panel}>
        {isLoading ? <div className={s.message}>Загружаем работы...</div> : null}

        {isError ? (
          <div className={s.message}>Не удалось загрузить работы. Попробуйте обновить страницу позже.</div>
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <div className={s.message}>Работы пока не опубликованы. Добавьте первые карточки в админке.</div>
        ) : null}

        {data.length > 0 ? (
          <div className={s.grid}>
            {data.map((item, index) => {
              return (
                <button key={item.id} type="button" className={s.card} onClick={() => setActiveWork(item)}>
                  <div className={s.media}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} />
                    ) : (
                      <div className={s.mediaFallback}>Фото проекта</div>
                    )}
                    <span className={s.type}>Проект</span>
                  </div>

                  <div className={s.cardBody}>
                    <span className={s.index}>{String(index + 1).padStart(2, '0')}</span>
                    <h2>{item.title}</h2>
                    <p>{trimText(item.caption, 'Подробности проекта можно уточнить у менеджера.')}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {activeWork ? (
        <div
          className={s.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={activeWork.title}
          onClick={() => setActiveWork(null)}
        >
          <div className={s.modalCard} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={s.modalClose} onClick={() => setActiveWork(null)} aria-label="Закрыть">
              ×
            </button>

            <button
              type="button"
              className={s.modalMedia}
              onClick={() => (activeWork.image_url ? setFullscreenImage(activeWork) : undefined)}
              aria-label="Открыть фото на весь экран"
            >
              {activeWork.image_url ? (
                <img src={activeWork.image_url} alt={activeWork.title} />
              ) : (
                <div className={s.mediaFallback}>Фото проекта</div>
              )}
            </button>

            <div className={s.modalBody}>
              <span className={s.typeInline}>Проект</span>
              <h2>{activeWork.title}</h2>
              <p>{activeWork.caption || 'Подробности проекта можно уточнить у менеджера.'}</p>
            </div>
          </div>
        </div>
      ) : null}

      {fullscreenImage?.image_url ? (
        <div
          className={s.lightboxOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenImage.title}
          onClick={() => setFullscreenImage(null)}
        >
          <button
            type="button"
            className={s.lightboxClose}
            onClick={() => setFullscreenImage(null)}
            aria-label="Закрыть"
          >
            ×
          </button>
          <img
            className={s.lightboxImage}
            src={fullscreenImage.image_url}
            alt={fullscreenImage.title}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  )
}
