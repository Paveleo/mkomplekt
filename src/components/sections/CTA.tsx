import { Link } from 'react-router-dom'
import Images from '@/images'
import s from './CTA.module.css'

type Props = {
  image?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
}

export default function CTA({
  image = Images.KitchenCTA,
  title = 'Обсудим ваш интерьер и подберём решение под задачу',
  subtitle = 'Если уже знаете, что нужно, оставьте заявку. Если ещё выбираете материалы и комплектацию, тоже пишите — поможем собрать проект спокойно и по делу.',
  ctaText = 'Оставить заявку',
  ctaHref = '/contacts',
}: Props) {
  return (
    <section className={s.wrap}>
      <div className={s.card}>
        <div className={s.copy}>
          <p className={s.eyebrow}>Следующий шаг</p>
          <h2 className={s.title}>{title}</h2>
          <p className={s.text}>{subtitle}</p>

          <div className={s.actions}>
            <Link className={s.primary} to={ctaHref}>
              {ctaText}
            </Link>
            <Link className={s.secondary} to="/catalog">
              Открыть каталог
            </Link>
          </div>
        </div>

        <div className={s.mediaCol}>
          <img className={s.media} src={image} alt="Материалы и мебельные решения" />
          <div className={s.badge}>
            <span className={s.badgeLabel}>МебельКомплект</span>
            <strong className={s.badgeTitle}>Материалы, производство и комплектация под ключ</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
