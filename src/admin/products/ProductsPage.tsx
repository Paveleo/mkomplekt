import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { arrayMove } from '../../utils/arrayMove';
import styles from '../admin.module.css';

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  category_id: string;
  sort: number;
};

export default function ProductsPage() {
  const qc = useQueryClient();
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AdminProduct[]>([]);

  const catsQ = useQuery({
    queryKey: ['categories-for-products'],
    queryFn: async () => apiRequest<{ id: string; title: string }[]>('/api/admin/categories/options'),
  });

  const q = useQuery({
    queryKey: ['products-admin', catFilter],
    queryFn: async () => {
      const suffix = catFilter ? `?category_id=${encodeURIComponent(catFilter)}` : '';
      return apiRequest<AdminProduct[]>(`/api/admin/products${suffix}`);
    },
  });

  useEffect(() => {
    if (q.data) {
      setRows(q.data);
    }
  }, [q.data]);

  const move = (index: number, delta: number) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    if (!catFilter && rows[targetIndex].category_id !== rows[index].category_id) return;
    setRows(arrayMove(rows, index, targetIndex));
  };

  const saveOrder = async () => {
    const pairs: { id: string; sort: number }[] = [];

    if (catFilter) {
      rows.forEach((row, index) => pairs.push({ id: row.id, sort: index }));
    } else {
      const counters = new Map<string, number>();
      for (const row of rows) {
        const next = counters.get(row.category_id) ?? 0;
        pairs.push({ id: row.id, sort: next });
        counters.set(row.category_id, next + 1);
      }
    }

    try {
      await apiRequest('/api/admin/products/order', {
        method: 'PUT',
        body: JSON.stringify(pairs),
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products-admin'] }),
        qc.invalidateQueries({ queryKey: ['products'] }),
      ]);
      alert('Порядок товаров сохранён');
    } catch (error: any) {
      alert(error.message || 'Не удалось сохранить порядок');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;

    try {
      await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' });
      await qc.invalidateQueries({ queryKey: ['products-admin'] });
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить товар');
    }
  };

  const categoryMap = new Map((catsQ.data || []).map((item) => [item.id, item.title]));
  const filteredRows = rows.filter((row) =>
    row.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const isReorderLocked = search.trim().length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Каталог</p>
          <h1 className={styles.title}>Товары</h1>
          <p className={styles.subtitle}>
            Здесь проще управлять карточками: искать, фильтровать, менять порядок и быстро переходить к редактированию.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/products/new" className={styles.buttonPrimary}>Новый товар</Link>
          <button className={styles.buttonSecondary} onClick={saveOrder}>Сохранить порядок</button>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Всего карточек</div>
          <div className={styles.statValue}>{rows.length}</div>
          <div className={styles.statMeta}>Товары во всех категориях.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Опубликованы</div>
          <div className={styles.statValue}>{rows.filter((row) => row.is_published).length}</div>
          <div className={styles.statMeta}>Видны посетителям сайта.</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Черновики</div>
          <div className={styles.statValue}>{rows.filter((row) => !row.is_published).length}</div>
          <div className={styles.statMeta}>Скрыты до публикации.</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <input
              className={styles.input}
              placeholder="Поиск по названию"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={catFilter}
              onChange={(event) => setCatFilter(event.target.value)}
            >
              <option value="">Все категории</option>
              {catsQ.data?.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.toolbarGroup}>
            <Link to="/admin/import" className={styles.buttonGhost}>Импорт Excel</Link>
          </div>
        </div>
      </div>

      {q.isLoading ? <div className={styles.inlineNotice}>Загрузка товаров...</div> : null}
      {q.isError ? <div className={styles.errorNotice}>Не удалось загрузить список товаров.</div> : null}

      {!q.isLoading && !q.isError && filteredRows.length === 0 ? (
        <div className={styles.emptyState}>По текущему фильтру товаров не найдено.</div>
      ) : null}

      {!q.isLoading && !q.isError && filteredRows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Товар</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Порядок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((product, index) => {
                const rowIndex = rows.findIndex((row) => row.id === product.id);

                return (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.tableTitle}>
                        <span className={styles.tablePrimary}>{product.title}</span>
                        <span className={styles.tableSecondary}>/{product.slug}</span>
                      </div>
                    </td>
                    <td>{categoryMap.get(product.category_id) || 'Без категории'}</td>
                    <td>
                      <span className={product.is_published ? styles.statusCompleted : styles.statusCancelled}>
                        {product.is_published ? 'Опубликован' : 'Скрыт'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.toolbarGroup}>
                        <button
                          className={styles.iconButton}
                          onClick={() => move(rowIndex, -1)}
                          disabled={rowIndex === 0 || isReorderLocked}
                        >
                          ↑
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={() => move(rowIndex, +1)}
                          disabled={rowIndex === rows.length - 1 || isReorderLocked}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <Link to={`/admin/products/${product.id}`} className={styles.buttonSecondary}>Редактировать</Link>
                        <button className={styles.buttonDanger} onClick={() => handleDelete(product.id)}>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {isReorderLocked ? (
        <div className={styles.inlineNotice}>
          Перестановка временно отключена, пока включён поиск. Очистите поиск, чтобы менять порядок товаров.
        </div>
      ) : null}
    </div>
  );
}
