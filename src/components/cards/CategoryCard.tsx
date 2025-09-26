
import { Link } from 'react-router-dom';
import s from './CategoryCard.module.css';

type Props = { item: any; to?: string };

export default function CategoryCard({ item, to }: Props) {
  const href = to ?? `/catalog/${item.slug}`;

  return (
    <Link to={href} className={s.card}>
      <div className={s.media}>
        <img src={item.image_url || 'https://placehold.co/600x400'} alt={item.title}/>
      </div>
      <div className={s.caption}>{item.title}</div>
    </Link>
  );
}
