import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
            if (error)
                throw error;
            return data || [];
        },
    });
    const [rows, setRows] = useState([]);
    useEffect(() => { if (q.data)
        setRows(q.data); }, [q.data]);
    // перемещаем внутри одной «группы родителя», чтобы не ломать иерархию
    const move = (index, delta) => {
        const cur = rows[index];
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= rows.length)
            return;
        // перемещать только если у соседей тот же parent_id
        if (rows[targetIndex].parent_id !== cur.parent_id)
            return;
        setRows(arrayMove(rows, index, targetIndex));
    };
    const saveOrder = async () => {
        // присвоим sort по порядку в рамках каждого parent_id
        const payload = [];
        let counters = new Map();
        for (const r of rows) {
            const key = (r.parent_id ?? null);
            const next = (counters.get(key) ?? 0);
            payload.push({ id: r.id, sort: next });
            counters.set(key, next + 1);
        }
        const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
        if (error) {
            alert(error.message);
            return;
        }
        await qc.invalidateQueries({ queryKey: ['categories'] });
        alert('Порядок категорий сохранён');
    };
    const handleDelete = async (id) => {
        if (!confirm('Удалить категорию? Убедитесь, что нет подкатегорий/товаров.'))
            return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error)
            return alert(error.message);
        qc.invalidateQueries({ queryKey: ['categories'] });
    };
    return (_jsxs("div", { children: [_jsx("h1", { children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), _jsx(CategoryForm, {}), q.isLoading ? _jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" }) : q.isError ? _jsx("p", { children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438" }) : (_jsxs(_Fragment, { children: [_jsxs("table", { style: { width: '100%', marginTop: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 90 }, children: "\u041F\u043E\u0440\u044F\u0434\u043E\u043A" }), _jsx("th", { children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }), _jsx("th", { children: "Slug" }), _jsx("th", { children: "Parent" }), _jsx("th", { style: { width: 120 } })] }) }), _jsx("tbody", { children: rows.map((c, i) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("button", { onClick: () => move(i, -1), disabled: i === 0 || (rows[i - 1]?.parent_id !== c.parent_id), children: "\u2191" }), ' ', _jsx("button", { onClick: () => move(i, +1), disabled: i === rows.length - 1 || (rows[i + 1]?.parent_id !== c.parent_id), children: "\u2193" })] }), _jsx("td", { children: c.title }), _jsx("td", { children: c.slug }), _jsx("td", { children: c.parent_id ? c.parent_id : '—' }), _jsx("td", { children: _jsx("button", { onClick: () => handleDelete(c.id), children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" }) })] }, c.id))) })] }), _jsx("div", { style: { marginTop: 12 }, children: _jsx("button", { onClick: saveOrder, children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A" }) })] }))] }));
}
