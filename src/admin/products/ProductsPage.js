import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { arrayMove } from '../../utils/arrayMove';
export default function ProductsPage() {
    const qc = useQueryClient();
    const [catFilter, setCatFilter] = useState('');
    const catsQ = useQuery({
        queryKey: ['categories-for-products'],
        queryFn: async () => {
            const { data, error } = await supabase.from('categories').select('id,title').order('title');
            if (error)
                throw error;
            return data || [];
        },
    });
    const q = useQuery({
        queryKey: ['products-admin', catFilter],
        queryFn: async () => {
            let req = supabase.from('products')
                .select('id, title, slug, is_published, category_id, sort')
                .eq('is_published', true)
                .order('category_id', { ascending: true })
                .order('sort', { ascending: true })
                .order('created_at', { ascending: false });
            if (catFilter)
                req = req.eq('category_id', catFilter);
            const { data, error } = await req;
            if (error)
                throw error;
            return data || [];
        },
    });
    const [rows, setRows] = useState([]);
    useEffect(() => { if (q.data)
        setRows(q.data); }, [q.data]);
    const move = (index, delta) => {
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= rows.length)
            return;
        if (!catFilter && rows[targetIndex].category_id !== rows[index].category_id)
            return;
        setRows(arrayMove(rows, index, targetIndex));
    };
    const saveOrder = async () => {
        const payload = [];
        if (catFilter) {
            rows.forEach((r, i) => payload.push({ id: r.id, sort: i }));
        }
        else {
            const counters = new Map();
            for (const r of rows) {
                const next = counters.get(r.category_id) ?? 0;
                payload.push({ id: r.id, sort: next });
                counters.set(r.category_id, next + 1);
            }
        }
        const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
        if (error)
            return alert(error.message);
        await qc.invalidateQueries({ queryKey: ['products-admin'] });
        alert('Порядок товаров сохранён');
    };
    const handleDelete = async (id) => {
        if (!confirm('Удалить товар?'))
            return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error)
            return alert(error.message);
        qc.invalidateQueries({ queryKey: ['products-admin'] });
    };
    return (_jsxs("div", { children: [_jsx("h1", { children: "\u0422\u043E\u0432\u0430\u0440\u044B" }), _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx(Link, { to: "/admin/products/new", children: "+ \u041D\u043E\u0432\u044B\u0439" }), _jsxs("select", { value: catFilter, onChange: (e) => setCatFilter(e.target.value), children: [_jsx("option", { value: "", children: "\u2014 \u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u2014" }), catsQ.data?.map((c) => (_jsx("option", { value: c.id, children: c.title }, c.id)))] }), _jsx("button", { onClick: saveOrder, children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A" })] }), q.isLoading ? _jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" }) : q.isError ? _jsx("p", { children: "\u041E\u0448\u0438\u0431\u043A\u0430\u2026" }) : (_jsxs("table", { style: { width: '100%', marginTop: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 90 }, children: "\u041F\u043E\u0440\u044F\u0434\u043E\u043A" }), _jsx("th", { children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }), _jsx("th", { children: "\u041F\u0443\u0431\u043B." }), _jsx("th", { style: { width: 160 } })] }) }), _jsx("tbody", { children: rows.map((p, i) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("button", { onClick: () => move(i, -1), disabled: i === 0, children: "\u2191" }), ' ', _jsx("button", { onClick: () => move(i, +1), disabled: i === rows.length - 1, children: "\u2193" })] }), _jsx("td", { children: p.title }), _jsx("td", { children: p.is_published ? 'Да' : 'Нет' }), _jsxs("td", { children: [_jsx(Link, { to: `/admin/products/${p.id}`, style: { marginRight: 8 }, children: "\u0420\u0435\u0434." }), _jsx("button", { onClick: () => handleDelete(p.id), children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }, p.id))) })] }))] }));
}
