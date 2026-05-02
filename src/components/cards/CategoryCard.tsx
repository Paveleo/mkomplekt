import { Link } from 'react-router-dom'
import Images from '@/images'
import s from './CategoryCard.module.css'

type CategoryItem = {
  slug: string
  title: string
  image_url?: string | null
}

type Props = { item: CategoryItem; to?: string }

export default function CategoryCard({ item, to }: Props) {
  const href = to ?? `/catalog/${item.slug}`

  return (
    <Link to={href} className={s.card}>
      <div className={s.media}>
        <img src={item.image_url || Images.nofoto} alt={item.title} />
      </div>
      <div className={s.body}>
        <h3 className={s.title}>{item.title}</h3>
        <span className={s.more}>Смотреть раздел</span>
      </div>
    </Link>
  )
}
