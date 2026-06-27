import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'

export type WorkItem = {
  id: string
  title: string
  caption: string
  image_url: string
  source_url?: string | null
  is_published: boolean
  sort: number
}

const normalizeWork = (item: Partial<WorkItem>, index: number): WorkItem => ({
  id: typeof item.id === 'string' && item.id ? item.id : `work-${index}`,
  title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Наш проект',
  caption: typeof item.caption === 'string' ? item.caption : '',
  image_url: typeof item.image_url === 'string' ? item.image_url : '',
  source_url: typeof item.source_url === 'string' ? item.source_url : null,
  is_published: Boolean(item.is_published),
  sort: typeof item.sort === 'number' ? item.sort : index,
})

export const useWorks = () =>
  useQuery({
    queryKey: ['works'],
    queryFn: async () => {
      const works = await apiRequest<Partial<WorkItem>[]>('/api/works')
      return Array.isArray(works) ? works.map(normalizeWork) : []
    },
  })
