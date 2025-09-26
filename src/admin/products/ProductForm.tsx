import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Form = {
  title: string;
  sku?: string;
  category_id: string; // обязателен
  price?: number | string;
  thickness?: number | string;
  color?: string;
  material?: string;
  description?: string;
  is_published?: boolean;
  images?: FileList;
};

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { register, handleSubmit, setValue } = useForm<Form>();
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('id,title').order('title');
      setCats(data || []);
      if (id) {
        const { data: p } = await supabase.from('products').select('*').eq('id', id).single();
        if (p) Object.entries(p).forEach(([k, v]) => setValue(k as any, v as any));
      } else {
        setValue('is_published', true as any);
      }
    })();
  }, [id, setValue]);

  const onSubmit = async (v: Form) => {
    const payload = {
      title: v.title,
      sku: v.sku || null,
      category_id: v.category_id || null, 
      price: v.price === '' || v.price === undefined ? null : Number(v.price),
      thickness: v.thickness === '' || v.thickness === undefined ? null : Number(v.thickness),
      color: v.color || null,
      material: v.material || null,
      description: v.description || null,
      is_published: !!v.is_published,
    };

    if (!payload.category_id) {
      alert('Выберите категорию');
      return;
    }

    let product: any;
    if (id) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
      if (error) return alert(error.message);
      product = data;
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select().single();
      if (error) return alert(error.message);
      product = data;
    }

    if (v.images && v.images.length) {
  const bucket = supabase.storage.from('products');

  // Папка только по ID — ASCII и неизменная
  const dir = String(product.id);

  for (let i = 0; i < v.images.length; i++) {
    const file = v.images[i];
    const dot = file.name.lastIndexOf('.');
    const ext = (dot >= 0 ? file.name.slice(dot) : '.jpg').toLowerCase();

    // Уникальное имя, чтобы не ловить кеш и не затирать старое
    const path = `${dir}/image-${i + 1}-${Date.now()}${ext}`;

    const { error: upErr } = await bucket.upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    });
    if (upErr) {
      console.error('UPLOAD ERROR:', upErr.message);
      alert('Ошибка загрузки изображения: ' + upErr.message);
      continue;
    }

    // Bucket public → берём публичный URL
    const { data: pub } = bucket.getPublicUrl(path);
    const url = pub.publicUrl;

    await supabase
      .from('product_images')
      .insert([{ product_id: product.id, url, sort: i }]);
  }
}


    nav('/admin/products');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <h1>{id ? 'Редактировать' : 'Новый товар'}</h1>

      <input placeholder="Название" {...register('title', { required: true })} />
      <input placeholder="SKU" {...register('sku')} />

      <select {...register('category_id', { required: true })}>
        <option value="">-- Категория --</option>
        {cats.map((c) => (
          <option key={c.id} value={c.id as string}>
            {c.title}
          </option>
        ))}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <input type="number" step="0.01" placeholder="Цена" {...register('price')} />
        <input type="number" step="0.1" placeholder="Толщина" {...register('thickness')} />
        <input placeholder="Цвет" {...register('color')} />
      </div>

      <input placeholder="Материал" {...register('material')} />
      <textarea placeholder="Описание" rows={6} {...register('description')} />
      <label>
        <input type="checkbox" {...register('is_published')} /> Публиковать
      </label>
      <input type="file" multiple accept="image/*" {...register('images')} />

      <button>Сохранить</button>
    </form>
  );
}
