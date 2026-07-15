import s from './TwoGisReviews.module.css'

const fallback = {
  url: 'https://2gis.ru/yakutsk/firm/7037402698862520/tab/reviews',
  cardUrl: 'https://2gis.ru/yakutsk/firm/7037402698862520',
  company: 'МебельКомплект',
  address: 'Окружная дорога, 59/1Б, Якутск',
  rating: '4.0',
  reviewsCount: '233',
}

export default function TwoGisReviews() {
  const reviewUrl = import.meta.env.VITE_2GIS_REVIEWS_URL || fallback.url
  const cardUrl = import.meta.env.VITE_2GIS_CARD_URL || fallback.cardUrl
  const company = import.meta.env.VITE_2GIS_COMPANY_NAME || fallback.company
  const address = import.meta.env.VITE_2GIS_ADDRESS || fallback.address
  const rating = import.meta.env.VITE_2GIS_RATING || fallback.rating
  const reviewsCount = import.meta.env.VITE_2GIS_REVIEWS_COUNT || fallback.reviewsCount

  return (
    <section className={s.wrap}>
      <div className={s.panel}>
        <div className={s.copy}>
          <p className={s.eyebrow}>2ГИС</p>
          <h2 className={s.title}>Отзывы и рейтинг в 2ГИС</h2>
          <p className={s.subtitle}>
            Быстрый переход в карточку компании с реальными оценками, отзывами и
            актуальной информацией по адресу.
          </p>

          <div className={s.companyCard}>
            <div className={s.companyMeta}>
              <div className={s.companyName}>{company}</div>
              <a className={s.companyAddress} href={cardUrl} target="_blank" rel="noreferrer">
                {address}
              </a>
            </div>

            <div className={s.stats}>
              <div className={s.stat}>
                <span className={s.statValue}>{rating}</span>
                <span className={s.statLabel}>рейтинг</span>
              </div>
              <div className={s.statDivider} />
              <div className={s.stat}>
                <span className={s.statValue}>{reviewsCount}</span>
                <span className={s.statLabel}>отзывов</span>
              </div>
            </div>
          </div>
        </div>

        <div className={s.actions}>
          <a className={s.primary} href={reviewUrl} target="_blank" rel="noreferrer">
            Читать отзывы в 2ГИС
          </a>
          <a className={s.secondary} href={cardUrl} target="_blank" rel="noreferrer">
            Открыть карточку компании
          </a>
        </div>
      </div>
    </section>
  )
}
