
import s from './USP.module.css';

const steps = [
  {
    no: 1,
    title: 'От идеи до концепции',
    text:
      'Обсудим ваш проект, учтём все детали и предложим функциональный дизайн.',
  },
  {
    no: 2,
    title: 'Проработка и согласование',
    text:
      'Уточним материалы, доработаем макет и утвердим финальный вариант.',
  },
  {
    no: 3,
    title: 'Производство и сборка под ключ',
    text:
      'Изготовим, упакуем, доставим и аккуратно соберём мебель на месте.',
  },
];

export default function USP() {
  return (
    <section className={s.wrap}>
      <div className={s.grid}>
        {steps.map((it) => (
          <article key={it.no} className={s.card}>
            <div className={s.no}>No. {it.no}</div>
            <h3 className={s.title}>{it.title}</h3>
            <p className={s.text}>{it.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
