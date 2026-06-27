import { Link } from 'react-router-dom'
import { useWorks } from '@/hooks/useWorks'
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
          <Link className={s.instagramLink} to="/contacts">
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
              const CardTag = item.source_url ? 'a' : 'article'
              const cardProps = item.source_url
                ? { href: item.source_url, target: '_blank', rel: 'noreferrer' }
                : {}

              return (
                <CardTag key={item.id} className={s.card} {...cardProps}>
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
                </CardTag>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
