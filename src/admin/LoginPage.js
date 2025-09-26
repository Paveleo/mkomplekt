import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const nav = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            alert(error.message);
        else
            nav('/admin');
    };
    return (_jsxs("form", { onSubmit: submit, style: { maxWidth: 360, margin: '64px auto', display: 'grid', gap: 12 }, children: [_jsx("h1", { children: "\u0412\u0445\u043E\u0434" }), _jsx("input", { placeholder: "Email", value: email, onChange: e => setEmail(e.target.value) }), _jsx("input", { placeholder: "\u041F\u0430\u0440\u043E\u043B\u044C", type: "password", value: password, onChange: e => setPassword(e.target.value) }), _jsx("button", { children: "\u0412\u043E\u0439\u0442\u0438" })] }));
}
