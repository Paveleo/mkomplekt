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

export const useReviews = () =>
  useQuery({
    queryKey: ['reviews'],
    queryFn: async () => apiRequest<ReviewItem[]>('/api/reviews'),
  })
