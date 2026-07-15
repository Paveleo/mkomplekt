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
            <a className={s.ctaPhone} href="tel:+79141011645">
              8 (914) 101-16-45
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
              <a href="tel:+79141011645">8 (914) 101-16-45</a>
              <a href="mailto:mk14ru@mail.ru">mk14ru@mail.ru</a>
              <a
                href="https://2gis.ru/yakutsk/search/%D0%AF%D0%BA%D1%83%D1%82%D1%81%D0%BA%2C%20%D0%9E%D0%BA%D1%80%D1%83%D0%B6%D0%BD%D0%B0%D1%8F%20%D0%B4%D0%BE%D1%80%D0%BE%D0%B3%D0%B0%2C%2059%2F1%D0%91"
                target="_blank"
                rel="noreferrer"
              >
                Якутск, Окружная дорога, 59/1Б
              </a>
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
