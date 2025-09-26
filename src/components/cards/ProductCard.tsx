import { Link } from 'react-router-dom';
import s from './ProductCard.module.css';

type Item = { id: string; slug: string; title: string; images?: { url: string }[] };

export default function ProductCard({ item }: { item: Item }) {
  const cover = item.images?.[0]?.url;

  return (
    <Link to={`/products/${item.slug}`} className={s.card}>
      <div className={s.thumb}>
        {cover ? <img src={cover} alt={item.title}/> : <div style={{opacity:.6}}>Нет фото</div>}
      </div>
      <div className={s.title}>{item.title}</div>
    </Link>
  );
}
