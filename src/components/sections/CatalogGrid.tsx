import { Link } from 'react-router-dom'
import CategoryCard from '@/components/cards/CategoryCard'
import { useRootCategories } from '@/hooks/useCategories'
import s from './CatalogGrid.module.css'

export default function CatalogGrid() {
  const { data } = useRootCategories()

  if (!data) {
    return null
  }

  const featured = data.slice(0, 4)

  return (
    <section className={s.wrap}>
      <div className={s.heading}>
        <p className={s.eyebrow}>Каталог</p>
        <h2 className={s.title}>Основные разделы каталога</h2>
        <p className={s.subtitle}>
          Быстрый доступ к ключевым направлениям: материалы, профили, мойки и мебельная
          фурнитура. Внутри каждого раздела собраны актуальные позиции и подкатегории.
        </p>
        <div className={s.headingAccent} aria-hidden="true">
          <span className={s.headingRule} />
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.grid}>
          {featured.map((item) => (
            <CategoryCard key={item.slug} item={item} />
          ))}
        </div>

        <div className={s.footer}>
          <p className={s.footerText}>
            Если нужен полный ассортимент, откройте весь каталог с подкатегориями и карточками
            товаров.
          </p>
          <Link className={s.moreBtn} to="/catalog">
            Открыть весь каталог
          </Link>
        </div>
      </div>
    </section>
  )
}
