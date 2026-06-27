import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'

export type InstagramWorkItem = {
  id: string
  caption: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string | null
  permalink: string
  timestamp?: string | null
}

export type InstagramWorksResponse = {
  configured: boolean
  profile_url: string
  items: InstagramWorkItem[]
  error?: string
}

export const useInstagramWorks = () =>
  useQuery({
    queryKey: ['instagram-works'],
    queryFn: async () => apiRequest<InstagramWorksResponse>('/api/works/instagram'),
    staleTime: 10 * 60 * 1000,
  })
