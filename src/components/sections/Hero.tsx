import { Link } from 'react-router-dom'
import Images from '@/images'
import s from './Hero.module.css'

const facts = [
  { value: '10+', label: 'лет на рынке мебели и комплектующих' },
  { value: '1000+', label: 'проектов для домов, квартир и бизнеса' },
  { value: '1 место', label: 'по ассортименту материалов и фурнитуры в регионе' },
]

export default function Hero() {
  return (
    <section className={s.hero}>
      <div className={s.container}>
        <div className={s.copy}>
          <p className={s.eyebrow}>МебельКомплект</p>
          <h1 className={s.title}>Материалы, фурнитура и мебельные решения в одном месте</h1>
          <p className={s.text}>
            Подбираем материалы, комплектуем проекты, изготавливаем корпусную мебель и помогаем
            собрать интерьер без лишних компромиссов. Всё в одном ритме: от выбора до заказа.
          </p>

          <div className={s.actions}>
            <Link className={s.primary} to="/catalog">
              Перейти в каталог
            </Link>
            <Link className={s.secondary} to="/contacts">
              Оставить заявку
            </Link>
          </div>

          <div className={s.accent} aria-hidden="true">
            <span className={s.rule} />
          </div>
        </div>

        <div className={s.mediaWrap}>
          <div className={s.mediaCard}>
            <img className={s.media} src={Images.Hero_bg} alt="Интерьер с мебельными решениями" />
            <div className={s.mediaOverlay} />
            <div className={s.mediaBadge}>
              <span className={s.mediaBadgeLabel}>Под ключ</span>
              <strong className={s.mediaBadgeTitle}>Каталог, производство и комплектация</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={s.factsWrap}>
        <div className={s.facts}>
          {facts.map((fact) => (
            <article key={fact.value} className={s.factCard}>
              <div className={s.factValue}>{fact.value}</div>
              <p className={s.factLabel}>{fact.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
