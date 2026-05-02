import { Link } from 'react-router-dom'
import Images from '@/images'
import s from './AboutSplit.module.css'

export default function AboutSplit() {
  return (
    <section className={s.wrap}>
      <div className={s.card}>
        <div className={s.textCol}>
          <p className={s.eyebrow}>Подход</p>
          <h2 className={s.title}>Мы создаём мебель не только по размерам, но и по ощущению дома</h2>
          <p className={s.lead}>
            Для нас мебель не сводится к функции. Это среда, в которой живут, работают,
            собираются с близкими и строят ежедневный ритм. Поэтому каждый проект мы продумываем
            с вниманием к деталям, материалам и тому, как пространство будет ощущаться в реальной
            жизни.
          </p>

          <div className={s.actions}>
            <Link className={s.primary} to="/about">
              Подробнее о компании
            </Link>
            <Link className={s.secondary} to="/contacts">
              Обсудить проект
            </Link>
          </div>
        </div>

        <div className={s.mediaCol}>
          <img src={Images.AboutSplitIMG} alt="Современная кухня в тёмных тонах" />
        </div>
      </div>
    </section>
  )
}
