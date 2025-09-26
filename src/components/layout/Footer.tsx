import s from './Footer.module.css';
import Images from '../../images'; 

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.top}>
        <div className={s.imageWrap}>
          <img
            src={Images?.FooterImage}
            alt="Интерьер"
          />
        </div>

        <div className={s.info}>
          <h2 className={s.title}>
            Мебель Под Вас.<br />Без Компромиссов.
          </h2>
          <p className={s.sub}>
            Обновите свой интерьер стильной и удобной мебелью.
            Найдите идеальную мебель прямо сейчас.
          </p>

          <div className={s.hr} />

          <div className={s.links}>
            <div>
              <div className={s.head}>Главные</div>
              <ul className={s.list}>
                <li><a href="/catalog">Каталог</a></li>
                <li><a href="/about">О нас</a></li>
                <li><a href="/reviews">Отзывы</a></li>
              </ul>
            </div>
            <div>
              <div className={s.head}>Социальные сети</div>
              <ul className={s.list}>
                <li><a href="https://t.me/mk14ru" target="_blank" rel="noreferrer">Телеграм</a></li>
                <li><a href="https://wa.me/89141011645" target="_blank" rel="noreferrer">Ватсапп</a></li>
                <li><a href="https://instagram.com/MEBEL_KOMPLEKT57" target="_blank" rel="noreferrer">Инстаграм</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={s.bottom}>
        <div className={s.copy}>© 2025 МКомплект. Все права защищены.</div>
        <a className={s.email} href="mailto:mk14ru@mail.ru">mk14ru@mail.ru</a>
      </div>
    </footer>
  );
}
