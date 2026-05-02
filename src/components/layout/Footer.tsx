import { Link } from 'react-router-dom'
import s from './Footer.module.css'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.shell}>
        <div className={s.top}>
          <div className={s.brandBlock}>
            <p className={s.eyebrow}>МебельКомплект</p>
            <h2 className={s.title}>Материалы, фурнитура и комплектация для мебельных проектов</h2>
            <p className={s.text}>
              Помогаем собрать проект без лишнего шума: каталог, консультация, комплектация и
              понятная связь на каждом этапе.
            </p>
          </div>

          <div className={s.ctaCard}>
            <span className={s.ctaLabel}>На связи</span>
            <a className={s.ctaPhone} href="tel:+79141011654">
              8 (914) 101-16-54
            </a>
            <p className={s.ctaText}>Оставьте заявку или свяжитесь напрямую, если нужен быстрый ответ.</p>
            <div className={s.actions}>
              <Link className={s.primary} to="/contacts">
                Оставить заявку
              </Link>
              <Link className={s.secondary} to="/catalog">
                Открыть каталог
              </Link>
            </div>
          </div>
        </div>

        <div className={s.linksGrid}>
          <div className={s.col}>
            <div className={s.head}>Разделы</div>
            <div className={s.links}>
              <Link to="/">Главная</Link>
              <Link to="/catalog">Каталог</Link>
              <Link to="/about">О нас</Link>
              <Link to="/contacts">Контакты</Link>
            </div>
          </div>

          <div className={s.col}>
            <div className={s.head}>Контакты</div>
            <div className={s.links}>
              <a href="tel:+79141011654">8 (914) 101-16-54</a>
              <a href="mailto:mk14ru@mail.ru">mk14ru@mail.ru</a>
              <span>Якутск, Окружная дорога, 59/1Б</span>
            </div>
          </div>

          <div className={s.col}>
            <div className={s.head}>Соцсети</div>
            <div className={s.links}>
              <a href="https://t.me/mk14ru" target="_blank" rel="noreferrer">
                Telegram
              </a>
              <a href="https://wa.me/89141011645" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a href="https://instagram.com/MEBEL_KOMPLEKT57" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className={s.bottom}>
          <div className={s.copy}>© {year} МебельКомплект. Все права защищены.</div>
          <div className={s.meta}>Сайт каталога, заявок и проектной комплектации</div>
        </div>
      </div>
    </footer>
  )
}
