import { useParams, Link } from 'react-router-dom'
import { useProductsByCategorySlug } from '@/hooks/useProducts'
import ProductCard from '@/components/cards/ProductCard'
import s from './ProductListPage.module.css'

export default function ProductListPage(){
  const { sub } = useParams<{sub: string}>()
  const { data } = useProductsByCategorySlug(sub!)

  return (
    <div className={s.wrap}>
      <Link to="/catalog" className={s.back}>← Назад</Link>
      <h1 className={s.title}>Товары</h1>

      {(!data || data.length === 0) ? (
        <div className={s.empty}>Пока нет товаров в этой подкатегории.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
          {data?.map((p:any) => (
            <ProductCard key={p.id} item={p} />
          ))}
        </div>
      )}
    </div>
  )
}
