import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function AdminLayout() {
    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => { setAuthed(!!data.session); setLoading(false); });
    }, []);
    if (loading)
        return null;
    if (!authed)
        return _jsx(Navigate, { to: "/admin/login", replace: true });
    return (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }, children: [_jsxs("aside", { style: { borderRight: '1px solid #eee', padding: 16 }, children: [_jsx("b", { children: "\u0410\u0434\u043C\u0438\u043D\u043A\u0430" }), _jsxs("nav", { style: { display: 'grid', gap: 8, marginTop: 16 }, children: [_jsx(Link, { to: "/admin", children: "\u0414\u0430\u0448\u0431\u043E\u0440\u0434" }), _jsx(Link, { to: "/admin/categories", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), _jsx(Link, { to: "/admin/products", children: "\u0422\u043E\u0432\u0430\u0440\u044B" }), _jsx(Link, { to: "/admin/import", children: "\u0418\u043C\u043F\u043E\u0440\u0442" })] }), _jsx("button", { style: { marginTop: 16 }, onClick: async () => { await supabase.auth.signOut(); location.href = '/admin/login'; }, children: "\u0412\u044B\u0439\u0442\u0438" })] }), _jsx("main", { style: { padding: 24 }, children: _jsx(Outlet, {}) })] }));
}
