
import { Link } from 'react-router-dom';
import CategoryCard from '@/components/cards/CategoryCard';
import { useRootCategories } from '@/hooks/useCategories';
import s from './CatalogGrid.module.css';

export default function CatalogGrid() {
  const { data } = useRootCategories();
  if (!data) return null;

  return (
    <section className={s.wrap}>
      {/* левая колонка: заголовок + 1 и 2 карточка (низкие) */}
      <div className={s.left}>
        <h2 className={s.title}>Наш<br/>Каталог</h2>
        <div className={s.leftCards}>
          {data[0] && <CategoryCard item={data[0]} />}
          {data[1] && <CategoryCard item={data[1]} />}
        </div>
      </div>

      {/* правая колонка: 3 и 4 карточка (высокие) */}
      <div className={s.right}>
        {data[2] && <CategoryCard item={data[2]} />}
        {data[3] && <CategoryCard item={data[3]} />}
      </div>

      <div className={s.moreWrap}>
        <Link className={s.moreBtn} to="/catalog">Ещё</Link>
      </div>
    </section>
  );
}
