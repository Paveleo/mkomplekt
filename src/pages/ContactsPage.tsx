import ContactForm from '@/components/forms/ContactForm';
import s from './ContactsPage.module.css';

export default function ContactsPage() {
  return (
    <section className={s.wrap}>
      {/* Левая колонка */}
      <div className={s.left}>
        <h1 className={s.h1}>Контакты</h1>

        <p className={s.lead}>
          Мы стремимся сделать сотрудничество максимально удобным и прозрачным.
          Мы всегда готовы помочь с выбором, проконсультировать по проектам и оформить заказ.
        </p>

        <div className={s.cols}>
          <div className={s.col}>
            <div className={s.label}>Наши номера</div>
            <div className={s.line}>8 (914) 101-16-54</div>
          </div>

          <div className={s.col}>
            <div className={s.label}>Наш адрес</div>
            <div className={s.line}>Окружная дорога, д. 59/1Б</div>
            <div className={s.line}>г. Якутск, Республика (Саха)</div>
          </div>

          <div className={s.col}>
            <div className={s.label}>Наша почта</div>
            <div className={s.line}>mk14ru@mail.ru</div>
          </div>
        </div>
      </div>

      {/* Правая колонка — карточка формы */}
      <aside className={s.card}>
        <h2 className={s.cardTitle}>Свяжитесь С Нами</h2>
        <p className={s.cardSub}>
          Заполните форму обратной связи, и менеджер свяжется с вами в течение суток
        </p>
        <ContactForm />
      </aside>
    </section>
  );
}
