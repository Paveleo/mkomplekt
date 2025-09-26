import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// useProductsByCategorySlug.ts
export const useProductsByCategorySlug = (slug: string) => useQuery({
  queryKey: ['products', slug],
  queryFn: async () => {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', slug).single();
    if (!cat) return [];
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, title, product_images(url, sort)') // <— ДОБАВИЛИ slug
      .eq('category_id', cat.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map(p => ({
      id: p.id,
      slug: p.slug,                 // <— ВОЗВРАЩАЕМ slug
      title: p.title,
      images: (p.product_images ?? [])
        .sort((a,b) => (a.sort ?? 0) - (b.sort ?? 0))
        .map(x => ({ url: x.url })),
    }));
  },
  enabled: !!slug,
});
