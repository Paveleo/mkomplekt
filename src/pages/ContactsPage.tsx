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
            <a className={s.link} href="tel:+79141011654">
              8 (914) 101-16-54
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
            <p className={s.textStrong}>Якутск, Окружная дорога, 59/1Б</p>
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
