import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import s from './Header.module.css';

type Props = { onHero?: boolean; ctaBlack?: boolean };

export default function Header({ onHero = false, ctaBlack = false }: Props) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(v => !v);
  const close  = () => setOpen(false);

  return (
    <header className={`${s.header} ${onHero ? s.onHero : ''} ${open ? s.open : ''}`}>
      <div className={s.inner}>
        <div className={s.row}>
          <Link className={s.logo} to="/" onClick={close}>МКомплект.</Link>

          {/* Десктоп-навигация. На мобилке превращается в выдвижную панель */}
          <nav className={s.nav} onClick={close}>
            <NavLink to="/">Главная</NavLink>
            <NavLink to="/catalog">Каталог</NavLink>
            <NavLink to="/about">О Нас</NavLink>
            <NavLink to="/contacts">Контакты</NavLink>
          </nav>

          {/* CTA — только на десктопе */}
          <Link
            to="/contacts"
            className={`${s.cta} ${ctaBlack ? s.ctaBlack : s.ctaWhite}`}
            onClick={close}
          >
            Оставить Заявку
          </Link>

          {/* Бургер — только на мобилке */}
          <button
            className={s.burger}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            onClick={toggle}
          />
        </div>
      </div>

      {/* Затемнение под выдвижной панелью */}
      <div className={s.scrim} onClick={close} />
    </header>
  );
}
