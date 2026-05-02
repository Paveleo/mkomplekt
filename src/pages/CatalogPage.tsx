import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogTree } from '@/hooks/useCategories'
import s from './CatalogPage.module.css'

const PREVIEW_LIMIT = 6

export default function CatalogPage() {
  const { data, isLoading, isError } = useCatalogTree()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpanded = (slug: string) => {
    setExpanded((current) => ({
      ...current,
      [slug]: !current[slug],
    }))
  }

  const totalSections = data?.length ?? 0
  const totalSubsections = data?.reduce((total, category) => total + category.children.length, 0) ?? 0

  return (
    <section className={s.wrap}>
      <div className={s.hero}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>Каталог</p>
          <h1 className={s.title}>Материалы, фурнитура и комплектующие для мебели</h1>
          <p className={s.subtitle}>
            Все разделы собраны в одной витрине: быстро переходите в нужную категорию, открывайте
            подкатегории и находите товары без лишних переходов.
          </p>
        </div>

        <div className={s.heroMeta}>
          <div className={s.metaCard}>
            <span className={s.metaValue}>{totalSections}</span>
            <span className={s.metaLabel}>основных разделов</span>
          </div>
          <div className={s.metaCard}>
            <span className={s.metaValue}>{totalSubsections}</span>
            <span className={s.metaLabel}>подкатегорий в каталоге</span>
          </div>
        </div>
      </div>

      <div className={s.headingAccent} aria-hidden="true">
        <span className={s.headingRule} />
      </div>

      <div className={s.panel}>
        {isLoading ? <div className={s.message}>Загружаем каталог...</div> : null}

        {isError ? <div className={s.message}>Не удалось загрузить каталог.</div> : null}

        {!isLoading && !isError && (!data || data.length === 0) ? (
          <div className={s.message}>Категории пока не добавлены.</div>
        ) : null}

        {!isLoading && !isError && data?.length ? (
          <div className={s.grid}>
            {data.map((category, index) => {
              const hasMore = category.children.length > PREVIEW_LIMIT
              const isExpanded = Boolean(expanded[category.slug])
              const visibleChildren = isExpanded
                ? category.children
                : category.children.slice(0, PREVIEW_LIMIT)

              return (
                <article key={category.id} className={s.card}>
                  <div className={s.cardTop}>
                    <span className={s.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={s.cardCount}>
                      {category.children.length
                        ? `${category.children.length} подкатегорий`
                        : 'Прямой переход в раздел'}
                    </span>
                  </div>

                  <Link to={`/catalog/${category.slug}`} className={s.categoryLink}>
                    {category.title}
                  </Link>

                  {visibleChildren.length ? (
                    <ul className={s.links}>
                      {visibleChildren.map((child) => (
                        <li key={child.id}>
                          <Link to={`/catalog/${category.slug}/${child.slug}`} className={s.childLink}>
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Link to={`/catalog/${category.slug}`} className={s.childLink}>
                      Открыть раздел
                    </Link>
                  )}

                  {hasMore ? (
                    <button
                      type="button"
                      className={s.toggle}
                      onClick={() => toggleExpanded(category.slug)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Скрыть список' : 'Показать все'}
                      <span className={`${s.chevron} ${isExpanded ? s.chevronUp : ''}`} aria-hidden="true" />
                    </button>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
