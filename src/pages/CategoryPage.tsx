import { Link, Navigate, useParams } from 'react-router-dom'
import { useCategoryBySlug, useChildrenCategories } from '@/hooks/useCategories'
import { useProductsByCategorySlug } from '@/hooks/useProducts'
import CategoryCard from '@/components/cards/CategoryCard'
import ProductCard from '@/components/cards/ProductCard'
import s from './CategoryPage.module.css'

function buildCatalogPath(parts: string[]) {
  return parts.length ? `/catalog/${parts.join('/')}` : '/catalog'
}

export default function CategoryPage() {
  const params = useParams<{ '*': string }>()
  const parts = (params['*'] || '').split('/').filter(Boolean)
  const slug = parts.at(-1) || ''

  if (!slug) {
    return <Navigate to="/catalog" replace />
  }

  const currentPath = buildCatalogPath(parts)
  const parentPath = buildCatalogPath(parts.slice(0, -1))

  const categoryQuery = useCategoryBySlug(slug)
  const childrenQuery = useChildrenCategories(slug)
  const productsQuery = useProductsByCategorySlug(slug)

  const hasChildren = (childrenQuery.data?.length ?? 0) > 0
  const hasProducts = (productsQuery.data?.length ?? 0) > 0
  const isLoading =
    categoryQuery.isLoading || childrenQuery.isLoading || productsQuery.isLoading

  return (
    <div className={s.wrap}>
      <Link to={parentPath} className={s.back}>← Назад</Link>

      {isLoading ? (
        <div className={s.empty}>Загружаем категорию...</div>
      ) : null}

      {categoryQuery.isError ? (
        <div className={s.empty}>Не удалось загрузить категорию.</div>
      ) : null}

      {!categoryQuery.isLoading && !categoryQuery.isError ? (
        <>
          <h1 className={s.title}>{categoryQuery.data?.title || 'Категория'}</h1>

          {hasChildren ? (
            <>
              <div className={s.sectionHeader}>Подкатегории</div>
              <div className={s.grid}>
                {childrenQuery.data?.map((child) => (
                  <CategoryCard
                    key={child.id}
                    item={child}
                    to={`${currentPath}/${child.slug}`}
                  />
                ))}
              </div>
            </>
          ) : null}

          {productsQuery.isError ? (
            <div className={s.empty}>Не удалось загрузить товары.</div>
          ) : null}

          {!productsQuery.isLoading && !productsQuery.isError && !hasProducts && !hasChildren ? (
            <div className={s.empty}>В этой категории пока нет товаров.</div>
          ) : null}

          {hasProducts ? (
            <>
              <div className={s.sectionHeader}>
                {hasChildren ? 'Товары в этом разделе' : 'Товары'}
              </div>
              <div className={s.grid}>
                {productsQuery.data?.map((product) => (
                  <ProductCard key={product.id} item={product} />
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
