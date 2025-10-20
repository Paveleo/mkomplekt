import { useEffect, useState, type CSSProperties } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { arrayMove } from '../../utils/arrayMove';

export default function ProductsPage() {
  const qc = useQueryClient();
  const [catFilter, setCatFilter] = useState<string>('');

  const catsQ = useQuery({
    queryKey: ['categories-for-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id,title').order('title');
      if (error) throw error;
      return data || [];
    },
  });

  const q = useQuery({
    queryKey: ['products-admin', catFilter],
    queryFn: async () => {
      let req = supabase
        .from('products')
        .select('id, title, slug, is_published, category_id, sort')
        .eq('is_published', true)
        .order('category_id', { ascending: true })
        .order('sort', { ascending: true })
        .order('created_at', { ascending: false });
      if (catFilter) req = req.eq('category_id', catFilter);
      const { data, error } = await req;
      if (error) throw error;
      return data || [];
    },
  });

  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (q.data) setRows(q.data);
  }, [q.data]);

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    if (!catFilter && rows[targetIndex].category_id !== rows[index].category_id) return;
    setRows(arrayMove(rows, index, targetIndex));
  };

  const saveOrder = async () => {
    const payload: { id: string; sort: number }[] = [];
    if (catFilter) {
      rows.forEach((r, i) => payload.push({ id: r.id, sort: i }));
    } else {
      const counters = new Map<string, number>();
      for (const r of rows) {
        const next = counters.get(r.category_id) ?? 0;
        payload.push({ id: r.id, sort: next });
        counters.set(r.category_id, next + 1);
      }
    }

    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) return alert(error.message);
    await qc.invalidateQueries({ queryKey: ['products-admin'] });
    alert('Порядок товаров сохранён');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ['products-admin'] });
  };

  return (
    <div>
      <h1>Товары</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/admin/products/new">+ Новый</Link>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">— Все категории —</option>
          {catsQ.data?.map((c: any) => (
            <option value={c.id} key={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button onClick={saveOrder}>Сохранить порядок</button>
      </div>

      {q.isLoading ? (
        <p>Загрузка…</p>
      ) : q.isError ? (
        <p>Ошибка…</p>
      ) : (
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  width: 90,
                  textAlign: 'left',
                  padding: '8px 4px',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Порядок
              </th>
              <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #e5e7eb' }}>
                Название
              </th>
              <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #e5e7eb' }}>
                Публ.
              </th>
              <th style={{ width: 160, borderBottom: '1px solid #e5e7eb' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const isLast = i === rows.length - 1;
              const cellStyle: CSSProperties = {
                borderBottom: isLast ? 'none' : '1px solid #e5e7eb', // линия между товарами
                padding: '8px 4px',
                verticalAlign: 'middle',
              };

              return (
                <tr key={p.id}>
                  <td style={cellStyle}>
                    <button onClick={() => move(i, -1)} disabled={i === 0}>
                      ↑
                    </button>{' '}
                    <button onClick={() => move(i, +1)} disabled={i === rows.length - 1}>
                      ↓
                    </button>
                  </td>
                  <td style={cellStyle}>{p.title}</td>
                  <td style={cellStyle}>{p.is_published ? 'Да' : 'Нет'}</td>
                  <td style={{ ...cellStyle, width: 160 }}>
                    <Link to={`/admin/products/${p.id}`} style={{ marginRight: 8 }}>
                      Ред.
                    </Link>
                    <button onClick={() => handleDelete(p.id)}>Удалить</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
