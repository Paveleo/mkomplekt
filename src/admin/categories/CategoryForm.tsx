import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const slugify = (s: string) =>
  s.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
    .replace(/^-+|-+$/g, '');

type Form = {
  title: string;
  parent_id?: string;
  image_url?: string;
  slug?: string;
};

type Category = {
  id: string;
  title: string;
  slug: string | null;
  parent_id: string | null;
  image_url?: string | null;
  sort?: number | null;
};

export default function CategoryForm({
  editing,
  onDone,
}: {
  editing: Category | null;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, reset } = useForm<Form>();

  const { data: cats } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () =>
      (await supabase.from('categories').select('id,title').order('title')).data || [],
  });

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title ?? '',
        parent_id: editing.parent_id ?? undefined,
        image_url: editing.image_url ?? '',
        slug: editing.slug ?? '',
      });
    } else {
      reset({ title: '', parent_id: undefined, image_url: '', slug: '' });
    }
  }, [editing, reset]);

  const titleWatch = watch('title') || '';

  const onSubmit = async (v: Form) => {
    const title = (v.title ?? '').trim();
    if (!title) return alert('Введите название категории');

    if (editing && v.parent_id === editing.id) {
      return alert('Категория не может быть своим родителем');
    }

    const payload: any = {
      title,
      parent_id: v.parent_id || null,
      image_url: v.image_url || null,
      slug: v.slug && v.slug.trim() ? slugify(v.slug) : slugify(title),
    };
    if (!editing) payload.sort = 0;

    let error;
    if (editing) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('categories').insert([payload]));
    }
    if (error) return alert(error.message);

    await Promise.all([
      qc.invalidateQueries({ queryKey: ['categories'] }),             
      qc.invalidateQueries({ queryKey: ['categories-all'] }),         
      qc.invalidateQueries({ queryKey: ['categories-for-products'] }), 
      qc.invalidateQueries({ queryKey: ['root-categories'] }),         
      qc.invalidateQueries({
        predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === 'child-categories',
      }),
    ]);

    reset();
    onDone();
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
          <option key={c.id} value={c.id} disabled={editing?.id === c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <input placeholder="Image URL" {...register('image_url')} />

      <button>{editing ? 'Сохранить' : 'Добавить'}</button>

      <div style={{ gridColumn: '1 / -1', fontSize: 12, opacity: 0.7 }}>
        {editing ? (
          <>
            Режим: <b>редактирование</b>. Слаг будет: <code>{slugify(titleWatch)}</code>{' '}
            <button type="button" onClick={onDone} style={{ marginLeft: 8 }}>
              Отмена
            </button>
          </>
        ) : (
          <>Слаг будет: <code>{slugify(titleWatch)}</code></>
        )}
      </div>
    </form>
  );
}
