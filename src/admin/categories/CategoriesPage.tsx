import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import CategoryForm from './CategoryForm';
import { arrayMove } from '../../utils/arrayMove';


export default function CategoriesPage() {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, title, slug, parent_id, sort')
        .order('parent_id', { ascending: true, nullsFirst: true })
        .order('sort', { ascending: true })
        .order('title', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { if (q.data) setRows(q.data); }, [q.data]);

  // перемещаем внутри одной «группы родителя», чтобы не ломать иерархию
  const move = (index: number, delta: number) => {
    const cur = rows[index];
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    // перемещать только если у соседей тот же parent_id
    if (rows[targetIndex].parent_id !== cur.parent_id) return;
    setRows(arrayMove(rows, index, targetIndex));
  };

  const saveOrder = async () => {
    // присвоим sort по порядку в рамках каждого parent_id
    const payload: { id: string; sort: number }[] = [];
    let counters = new Map<string | null, number>();

    for (const r of rows) {
      const key = (r.parent_id ?? null) as string | null;
      const next = (counters.get(key) ?? 0);
      payload.push({ id: r.id, sort: next });
      counters.set(key, next + 1);
    }

    const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
    if (error) { alert(error.message); return; }
    await qc.invalidateQueries({ queryKey: ['categories'] });
    alert('Порядок категорий сохранён');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию? Убедитесь, что нет подкатегорий/товаров.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ['categories'] });
  };

  return (
    <div>
      <h1>Категории</h1>
      <CategoryForm />

      {q.isLoading ? <p>Загрузка…</p> : q.isError ? <p>Ошибка загрузки</p> : (
        <>
          <table style={{ width: '100%', marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{width:90}}>Порядок</th>
                <th>Название</th>
                <th>Slug</th>
                <th>Parent</th>
                <th style={{width:120}}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <button onClick={() => move(i, -1)} disabled={i === 0 || (rows[i-1]?.parent_id !== c.parent_id)}>↑</button>{' '}
                    <button onClick={() => move(i, +1)} disabled={i === rows.length-1 || (rows[i+1]?.parent_id !== c.parent_id)}>↓</button>
                  </td>
                  <td>{c.title}</td>
                  <td>{c.slug}</td>
                  <td>{c.parent_id ? c.parent_id : '—'}</td>
                  <td><button onClick={() => handleDelete(c.id)}>Удалить</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <button onClick={saveOrder}>Сохранить порядок</button>
          </div>
        </>
      )}
    </div>
  );
}
