import Images from '../images'
import s from './AboutPage.module.css'

const storyBlocks = [
  {
    eyebrow: 'Кто мы',
    title: 'Крупный поставщик мебельных материалов и фурнитуры в Якутии',
    text: 'Мы развиваем МебельКомплект как пространство, где в одном месте можно подобрать материалы, фасады, комплектующие и производство под конкретный интерьер. Работаем с частными клиентами, мебельщиками и студиями.',
    image: Images.About1,
  },
  {
    eyebrow: 'Производство',
    title: 'Собственные цеха и команда, которая ведет проект от идеи до результата',
    text: 'В производстве используем современное оборудование, а над каждым заказом работают специалисты, которые понимают не только размеры и материалы, но и реальную эксплуатацию мебели. Поэтому мы не просто продаем комплектующие, а собираем решение целиком.',
    image: Images.About2,
    reverse: true,
  },
  {
    eyebrow: 'Подход',
    title: 'Более 10 лет опыта, внимание к деталям и понятный сервис',
    text: 'Нам важно, чтобы клиенту было удобно на каждом этапе: от консультации и подбора материалов до изготовления, комплектации и сборки. Именно такой подход помог выстроить доверие тысяч заказчиков в регионе.',
    image: Images.About3,
  },
]

const facts = [
  { value: '10+', label: 'лет опыта в мебельной отрасли' },
  { value: '1000+', label: 'реализованных проектов и комплектаций' },
  { value: 'Полный цикл', label: 'материалы, производство, доставка и сборка' },
]

export default function AboutPage() {
  return (
    <section className={s.wrap}>
      <div className={s.hero}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>О компании</p>
          <h1 className={s.title}>Делаем мебельные проекты собранными, точными и удобными в работе</h1>
          <p className={s.subtitle}>
            МебельКомплект объединяет поставку материалов, производство фасадов и корпусной мебели,
            подбор комплектующих и сопровождение проекта. Мы строим сервис так, чтобы интерьер
            собирался без хаоса и лишних потерь времени.
          </p>
        </div>

        <div className={s.heroNote}>
          <span className={s.noteLabel}>Фокус</span>
          <p className={s.noteText}>
            Помогаем как частным клиентам, так и мебельным производствам: подбираем решения,
            считаем комплектацию и доводим проект до результата.
          </p>
        </div>
      </div>

      <div className={s.headingAccent} aria-hidden="true">
        <span className={s.headingRule} />
      </div>

      <div className={s.facts}>
        {facts.map((fact) => (
          <article key={fact.label} className={s.factCard}>
            <span className={s.factValue}>{fact.value}</span>
            <p className={s.factLabel}>{fact.label}</p>
          </article>
        ))}
      </div>

      <div className={s.story}>
        {storyBlocks.map((block) => (
          <article
            key={block.title}
            className={`${s.storyCard} ${block.reverse ? s.storyCardReverse : ''}`.trim()}
          >
            <div className={s.storyCopy}>
              <p className={s.storyEyebrow}>{block.eyebrow}</p>
              <h2 className={s.storyTitle}>{block.title}</h2>
              <p className={s.storyText}>{block.text}</p>
            </div>

            <div className={s.storyMedia}>
              <img src={block.image} alt={block.title} className={s.storyImage} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
