import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useRootCategories = () => useQuery({
  queryKey:['root-categories'],
  queryFn: async ()=>{
    const { data, error } = await supabase.from('categories').select('*').is('parent_id', null).order('sort')
    if (error) throw error
    return data
  }
})

export const useChildrenCategories = (slug:string) => useQuery({
  queryKey:['child-categories', slug],
  queryFn: async ()=>{
    const { data: parent } = await supabase.from('categories').select('id,title,slug').eq('slug', slug).single()
    if (!parent) return []
    const { data, error } = await supabase.from('categories').select('*').eq('parent_id', parent.id).order('sort')
    if (error) throw error
    return data
  }
})
