import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'

export type ProductCardItem = {
  id: string
  slug: string
  title: string
  price?: number | null
  size?: string | null
  thickness?: number | null
  color?: string | null
  unit?: string | null
  images?: { url: string }[]
}

export const useProductsByCategorySlug = (slug: string) => useQuery({
  queryKey: ['products', slug],
  queryFn: async () => apiRequest<ProductCardItem[]>(`/api/catalog/products/by-category/${slug}`),
  enabled: !!slug,
});
