import s from './USP.module.css'

const steps = [
  {
    no: '01',
    title: 'От идеи до концепции',
    text: 'Обсудим ваш проект, учтём детали пространства и предложим функциональное решение под ваш сценарий жизни.',
  },
  {
    no: '02',
    title: 'Проработка и согласование',
    text: 'Уточним материалы, доработаем макет, соберём комплектацию и согласуем финальный вариант без лишней спешки.',
  },
  {
    no: '03',
    title: 'Производство и сборка',
    text: 'Изготовим, упакуем, доставим и аккуратно соберём мебель на месте, чтобы проект дошёл до результата под ключ.',
  },
]

export default function USP() {
  return (
    <section className={s.wrap}>
      <div className={s.heading}>
        <p className={s.eyebrow}>Как работаем</p>
        <h2 className={s.title}>Понятный путь от запроса до готового интерьера</h2>
        <p className={s.subtitle}>
          Ведём проект последовательно: от первой идеи и подбора материалов до производства,
          доставки и сборки.
        </p>
      </div>

      <div className={s.grid}>
        {steps.map((item) => (
          <article key={item.no} className={s.card}>
            <div className={s.no}>{item.no}</div>
            <h3 className={s.cardTitle}>{item.title}</h3>
            <p className={s.text}>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
