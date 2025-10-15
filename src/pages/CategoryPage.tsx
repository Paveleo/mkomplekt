import { useParams, Link } from 'react-router-dom';
import { useChildrenCategories } from '@/hooks/useCategories';
import { useProductsByCategorySlug } from '@/hooks/useProducts';
import CategoryCard from '@/components/cards/CategoryCard';
import ProductCard from '@/components/cards/ProductCard';
import s from './CategoryPage.module.css';

export default function CategoryPage(){
  const { category } = useParams<{category: string}>();

  const { data: children } = useChildrenCategories(category!);
  const isLeaf = (children?.length ?? 0) === 0;

  const { data: products } = useProductsByCategorySlug(isLeaf ? category! : '');

  return (
    <div className={s.wrap}>
      <Link to="/catalog" className={s.back}>← Назад</Link>

      {!isLeaf ? (
        <>
          <h1 className={s.title}>Подкатегории</h1>
          <div className={s.grid}>
            {children?.map((c:any) => (
              <CategoryCard key={c.id} item={c} to={`/catalog/${category}/${c.slug}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className={s.title}>Товары</h1>
          <div className={s.grid}>
            {products?.map((p:any) => (
              <ProductCard
  key={p.id}
  item={{
    id: p.id,
    slug: p.slug,
    title: p.title,
    images: p.images
  }}
/>

            ))}
          </div>
        </>
      )}
    </div>
  );
}
