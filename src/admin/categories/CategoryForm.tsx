import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import styles from '../admin.module.css';

const slugify = (value: string) =>
  value
    .trim()
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
    queryFn: async () => apiRequest<{ id: string; title: string }[]>('/api/admin/categories/options'),
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

  const title = watch('title') || '';
  const manualSlug = watch('slug') || '';

  const onSubmit = async (values: Form) => {
    const trimmedTitle = (values.title ?? '').trim();
    if (!trimmedTitle) {
      alert('Введите название категории');
      return;
    }

    if (editing && values.parent_id === editing.id) {
      alert('Категория не может быть своим родителем');
      return;
    }

    const payload = {
      title: trimmedTitle,
      parent_id: values.parent_id || null,
      image_url: values.image_url || null,
      slug: values.slug && values.slug.trim() ? slugify(values.slug) : slugify(trimmedTitle),
    };

    try {
      if (editing) {
        await apiRequest(`/api/admin/categories/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка сохранения категории');
      return;
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ['categories'] }),
      qc.invalidateQueries({ queryKey: ['categories-all'] }),
      qc.invalidateQueries({ queryKey: ['categories-for-products'] }),
      qc.invalidateQueries({ queryKey: ['root-categories'] }),
      qc.invalidateQueries({ queryKey: ['catalog-tree'] }),
      qc.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'child-categories',
      }),
    ]);

    reset();
    onDone();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>{editing ? 'Редактирование категории' : 'Новая категория'}</h2>
          <p className={styles.cardText}>
            Создайте корневую категорию или вложите её в уже существующую структуру каталога.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formStack}>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Название</span>
            <input className={styles.input} placeholder="Например: Столешницы" {...register('title', { required: true })} />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Родительская категория</span>
            <select className={styles.select} {...register('parent_id')}>
              <option value="">Корневая категория</option>
              {cats?.map((category) => (
                <option key={category.id} value={category.id} disabled={editing?.id === category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Изображение</span>
            <input className={styles.input} placeholder="Ссылка на изображение" {...register('image_url')} />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Slug</span>
            <input className={styles.input} placeholder="Можно оставить пустым" {...register('slug')} />
            <span className={styles.fieldHint}>
              Итоговый slug: <code>{manualSlug ? slugify(manualSlug) : slugify(title)}</code>
            </span>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonPrimary}>{editing ? 'Сохранить категорию' : 'Добавить категорию'}</button>
          {editing ? (
            <button type="button" className={styles.buttonGhost} onClick={onDone}>
              Отмена
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
