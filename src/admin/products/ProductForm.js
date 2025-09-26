import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function ProductForm() {
    const { id } = useParams();
    const nav = useNavigate();
    const { register, handleSubmit, setValue } = useForm();
    const [cats, setCats] = useState([]);
    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('categories').select('id,title').order('title');
            setCats(data || []);
            if (id) {
                const { data: p } = await supabase.from('products').select('*').eq('id', id).single();
                if (p)
                    Object.entries(p).forEach(([k, v]) => setValue(k, v));
            }
            else {
                setValue('is_published', true);
            }
        })();
    }, [id, setValue]);
    const onSubmit = async (v) => {
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
        let product;
        if (id) {
            const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
            if (error)
                return alert(error.message);
            product = data;
        }
        else {
            const { data, error } = await supabase.from('products').insert([payload]).select().single();
            if (error)
                return alert(error.message);
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
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), style: { display: 'grid', gap: 12, maxWidth: 720 }, children: [_jsx("h1", { children: id ? 'Редактировать' : 'Новый товар' }), _jsx("input", { placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", ...register('title', { required: true }) }), _jsx("input", { placeholder: "SKU", ...register('sku') }), _jsxs("select", { ...register('category_id', { required: true }), children: [_jsx("option", { value: "", children: "-- \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F --" }), cats.map((c) => (_jsx("option", { value: c.id, children: c.title }, c.id)))] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }, children: [_jsx("input", { type: "number", step: "0.01", placeholder: "\u0426\u0435\u043D\u0430", ...register('price') }), _jsx("input", { type: "number", step: "0.1", placeholder: "\u0422\u043E\u043B\u0449\u0438\u043D\u0430", ...register('thickness') }), _jsx("input", { placeholder: "\u0426\u0432\u0435\u0442", ...register('color') })] }), _jsx("input", { placeholder: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B", ...register('material') }), _jsx("textarea", { placeholder: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", rows: 6, ...register('description') }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", ...register('is_published') }), " \u041F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u0442\u044C"] }), _jsx("input", { type: "file", multiple: true, accept: "image/*", ...register('images') }), _jsx("button", { children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] }));
}
