import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// простой slugify (оставляет кириллицу, пробелы/символы -> "-")
const slugify = (s: string) =>
  s.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
    .replace(/^-+|-+$/g, '');

type Form = {
  title: string;
  parent_id?: string;
  image_url?: string;
  sort?: number;
  slug?: string;
};

export default function CategoryForm() {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, reset } = useForm<Form>();

  const { data: cats } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () =>
      (await supabase.from('categories').select('id,title').order('title')).data || [],
  });

  const titleWatch = watch('title') || '';

  const onSubmit = async (v: Form) => {
  const title = (v.title ?? '').trim();
  if (!title) {
    alert('Введите название категории');
    return;
  }
  
  const payload = {
    title,
    parent_id: v.parent_id || null,
    image_url: v.image_url || null,
    sort: typeof v.sort === 'number' ? v.sort : 0,
    slug: v.slug && v.slug.trim() ? slugify(v.slug) : slugify(title),
  };

  const { error } = await supabase.from('categories').insert([payload]);
  if (error) {
    alert(error.message);
    return;
  }

  reset();
  qc.invalidateQueries({ queryKey: ['categories'] });
};


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 120px',
        gap: 8,
        margin: '16px 0',
      }}
    >
      <input placeholder="Название" {...register('title', { required: true })} />

      <select {...register('parent_id')}>
        <option value="">— Корневая —</option>
        {cats?.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <input placeholder="Image URL" {...register('image_url')} />
      <button>Добавить</button>

      <div style={{ gridColumn: '1 / -1', fontSize: 12, opacity: 0.7 }}>
        Слаг будет: <code>{slugify(titleWatch)}</code>
      </div>
    </form>
  );
}
