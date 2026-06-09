import { Link } from 'react-router-dom';
import s from './ProductCard.module.css';

type Item = {
  id: string;
  slug: string;
  title: string;
  size?: string | null;
  thickness?: number | null;
  color?: string | null;
  unit?: string | null;
  images?: { url: string }[];
};

function formatMeta(item: Item) {
  return [
    item.size,
    typeof item.thickness === 'number' ? `${item.thickness} мм` : null,
    item.color,
    item.unit,
  ].filter(Boolean).join(' / ');
}

export default function ProductCard({ item }: { item: Item }) {
  const cover = item.images?.[0]?.url;
  const meta = formatMeta(item);

  return (
    <Link to={`/products/${item.slug}`} className={s.card}>
      <div className={s.thumb}>
        {cover ? <img src={cover} alt={item.title}/> : <div style={{opacity:.6}}>Нет фото</div>}
      </div>
      <div className={s.title}>{item.title}</div>
      {meta ? <div className={s.meta}>{meta}</div> : null}
    </Link>
  );
}
