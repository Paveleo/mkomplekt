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
  const hasChildren = (childrenQuery.data?.length ?? 0) > 0

  const productsQuery = useProductsByCategorySlug(
    !childrenQuery.isLoading && !hasChildren ? slug : '',
  )

  return (
    <div className={s.wrap}>
      <Link to={parentPath} className={s.back}>← Назад</Link>

      {categoryQuery.isLoading || childrenQuery.isLoading ? (
        <div className={s.empty}>Загружаем категорию...</div>
      ) : null}

      {categoryQuery.isError ? (
        <div className={s.empty}>Не удалось загрузить категорию.</div>
      ) : null}

      {!categoryQuery.isLoading && !categoryQuery.isError ? (
        <>
          <h1 className={s.title}>{categoryQuery.data?.title || 'Категория'}</h1>

          {hasChildren ? (
            <div className={s.grid}>
              {childrenQuery.data?.map((child) => (
                <CategoryCard
                  key={child.id}
                  item={child}
                  to={`${currentPath}/${child.slug}`}
                />
              ))}
            </div>
          ) : (
            <>
              {productsQuery.isLoading ? (
                <div className={s.empty}>Загружаем товары...</div>
              ) : null}

              {productsQuery.isError ? (
                <div className={s.empty}>Не удалось загрузить товары.</div>
              ) : null}

              {!productsQuery.isLoading && !productsQuery.isError && !productsQuery.data?.length ? (
                <div className={s.empty}>В этой категории пока нет товаров.</div>
              ) : null}

              {productsQuery.data?.length ? (
                <div className={s.grid}>
                  {productsQuery.data.map((product) => (
                    <ProductCard key={product.id} item={product} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </div>
  )
}
