import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// простой slugify (оставляет кириллицу, пробелы/символы -> "-")
const slugify = (s) => s.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
    .replace(/^-+|-+$/g, '');
export default function CategoryForm() {
    const qc = useQueryClient();
    const { register, handleSubmit, watch, reset } = useForm();
    const { data: cats } = useQuery({
        queryKey: ['categories-all'],
        queryFn: async () => (await supabase.from('categories').select('id,title').order('title')).data || [],
    });
    const titleWatch = watch('title') || '';
    const onSubmit = async (v) => {
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
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 120px',
            gap: 8,
            margin: '16px 0',
        }, children: [_jsx("input", { placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", ...register('title', { required: true }) }), _jsxs("select", { ...register('parent_id'), children: [_jsx("option", { value: "", children: "\u2014 \u041A\u043E\u0440\u043D\u0435\u0432\u0430\u044F \u2014" }), cats?.map((c) => (_jsx("option", { value: c.id, children: c.title }, c.id)))] }), _jsx("input", { placeholder: "Image URL", ...register('image_url') }), _jsx("button", { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C" }), _jsxs("div", { style: { gridColumn: '1 / -1', fontSize: 12, opacity: 0.7 }, children: ["\u0421\u043B\u0430\u0433 \u0431\u0443\u0434\u0435\u0442: ", _jsx("code", { children: slugify(titleWatch) })] })] }));
}
