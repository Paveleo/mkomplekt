import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'

export type ReviewItem = {
  id: string
  name: string
  city?: string | null
  role?: string | null
  avatar_url?: string | null
  image_url?: string | null
  text: string[]
}

const normalizeReview = (item: Partial<ReviewItem>, index: number): ReviewItem => {
  const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Клиент'
  const text = Array.isArray(item.text)
    ? item.text.filter((paragraph): paragraph is string => typeof paragraph === 'string' && Boolean(paragraph.trim()))
    : []

  return {
    id: typeof item.id === 'string' && item.id ? item.id : `review-${index}`,
    name,
    city: typeof item.city === 'string' ? item.city : null,
    role: typeof item.role === 'string' ? item.role : null,
    avatar_url: typeof item.avatar_url === 'string' ? item.avatar_url : null,
    image_url: typeof item.image_url === 'string' ? item.image_url : null,
    text: text.length ? text : ['Отзыв скоро появится.'],
  }
}

export const useReviews = () =>
  useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const reviews = await apiRequest<Partial<ReviewItem>[]>('/api/reviews')
      return Array.isArray(reviews) ? reviews.map(normalizeReview) : []
    },
  })
