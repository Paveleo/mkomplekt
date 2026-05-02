import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'

export type CatalogCategory = {
  id: string
  slug: string
  title: string
  parent_id: string | null
  image_url: string | null
  sort: number | null
}

export type CatalogTreeNode = CatalogCategory & {
  children: CatalogTreeNode[]
}

export const useRootCategories = () => useQuery({
  queryKey:['root-categories'],
  queryFn: async ()=> apiRequest<CatalogCategory[]>('/api/catalog/root-categories')
})

export const useChildrenCategories = (slug:string) => useQuery({
  queryKey:['child-categories', slug],
  queryFn: async ()=> apiRequest<CatalogCategory[]>(`/api/catalog/children/${slug}`),
  enabled: !!slug,
})

export const useCategoryBySlug = (slug: string) => useQuery({
  queryKey: ['category', slug],
  queryFn: async () => apiRequest<CatalogCategory>(`/api/catalog/category/${slug}`),
  enabled: !!slug,
})

export const useCatalogTree = () => useQuery({
  queryKey: ['catalog-tree'],
  queryFn: async (): Promise<CatalogTreeNode[]> => apiRequest<CatalogTreeNode[]>('/api/catalog/tree'),
})
