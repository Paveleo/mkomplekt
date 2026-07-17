import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'

export type CatalogCategory = {
  id: string
  slug: string
  title: string
  parent_id: string | null
  image_url: string | null
  is_visible: boolean
  sort: number | null
}

export type CatalogTreeNode = CatalogCategory & {
  children: CatalogTreeNode[]
}

const normalizeCategory = (item: Partial<CatalogCategory>, index: number): CatalogCategory => ({
  id: typeof item.id === 'string' && item.id ? item.id : `category-${index}`,
  slug: typeof item.slug === 'string' ? item.slug : '',
  title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Без названия',
  parent_id: typeof item.parent_id === 'string' ? item.parent_id : null,
  image_url: typeof item.image_url === 'string' ? item.image_url : null,
  is_visible: item.is_visible !== false,
  sort: typeof item.sort === 'number' ? item.sort : null,
})

const normalizeCategoryArray = (items: unknown): CatalogCategory[] =>
  Array.isArray(items) ? items.map((item, index) => normalizeCategory(item as Partial<CatalogCategory>, index)) : []

const normalizeTreeNode = (item: Partial<CatalogTreeNode>, index: number): CatalogTreeNode => ({
  ...normalizeCategory(item, index),
  children: Array.isArray(item.children)
    ? item.children.map((child, childIndex) => normalizeTreeNode(child as Partial<CatalogTreeNode>, childIndex))
    : [],
})

export const useRootCategories = () => useQuery({
  queryKey:['root-categories'],
  queryFn: async ()=> {
    const categories = await apiRequest<unknown>('/api/catalog/root-categories')
    return normalizeCategoryArray(categories)
  }
})

export const useChildrenCategories = (slug:string) => useQuery({
  queryKey:['child-categories', slug],
  queryFn: async ()=> {
    const categories = await apiRequest<unknown>(`/api/catalog/children/${slug}`)
    return normalizeCategoryArray(categories)
  },
  enabled: !!slug,
})

export const useCategoryBySlug = (slug: string) => useQuery({
  queryKey: ['category', slug],
  queryFn: async () => {
    const category = await apiRequest<Partial<CatalogCategory>>(`/api/catalog/category/${slug}`)
    return normalizeCategory(category, 0)
  },
  enabled: !!slug,
})

export const useCatalogTree = () => useQuery({
  queryKey: ['catalog-tree'],
  queryFn: async (): Promise<CatalogTreeNode[]> => {
    const tree = await apiRequest<unknown>('/api/catalog/tree')
    return Array.isArray(tree)
      ? tree.map((item, index) => normalizeTreeNode(item as Partial<CatalogTreeNode>, index))
      : []
  },
})
