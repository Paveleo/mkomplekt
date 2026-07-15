import ContactForm from '@/components/forms/ContactForm'
import s from './ContactsPage.module.css'

export default function ContactsPage() {
  return (
    <section className={s.wrap}>
      <div className={s.left}>
        <div className={s.heading}>
          <p className={s.eyebrow}>Контакты</p>
          <h1 className={s.h1}>Обсудим ваш проект</h1>
          <p className={s.lead}>
            Поможем подобрать материалы, рассчитать комплектацию и собрать заказ под ваш интерьер.
            Оставьте заявку, и менеджер увидит её в админке сразу после отправки.
          </p>
          <div className={s.headingAccent} aria-hidden="true">
            <span className={s.headingRule} />
          </div>
        </div>

        <div className={s.infoGrid}>
          <article className={s.infoCard}>
            <span className={s.label}>Телефон</span>
            <a className={s.link} href="tel:+79141011645">
              8 (914) 101-16-45
            </a>
            <p className={s.text}>Позвоните напрямую, если нужна быстрая консультация.</p>
          </article>

          <article className={s.infoCard}>
            <span className={s.label}>Почта</span>
            <a className={s.link} href="mailto:mk14ru@mail.ru">
              mk14ru@mail.ru
            </a>
            <p className={s.text}>Подходит для файлов, спецификаций и длинных запросов.</p>
          </article>

          <article className={`${s.infoCard} ${s.infoCardWide}`}>
            <span className={s.label}>Адрес</span>
            <a
              className={s.textStrong}
              href="https://2gis.ru/yakutsk/search/%D0%AF%D0%BA%D1%83%D1%82%D1%81%D0%BA%2C%20%D0%9E%D0%BA%D1%80%D1%83%D0%B6%D0%BD%D0%B0%D1%8F%20%D0%B4%D0%BE%D1%80%D0%BE%D0%B3%D0%B0%2C%2059%2F1%D0%91"
              target="_blank"
              rel="noreferrer"
            >
              Якутск, Окружная дорога, 59/1Б
            </a>
            <p className={s.text}>
              Если хотите, оставьте заявку заранее, чтобы менеджер подготовился к встрече и
              подобрал нужные позиции до вашего приезда.
            </p>
          </article>
        </div>
      </div>

      <aside className={s.card}>
        <p className={s.cardEyebrow}>Форма заявки</p>
        <h2 className={s.cardTitle}>Свяжитесь с нами</h2>
        <p className={s.cardSub}>
          Заполните форму, и обращение автоматически попадёт в админку. Менеджер свяжется с вами
          в течение рабочего дня.
        </p>
        <ContactForm />
      </aside>
    </section>
  )
}
