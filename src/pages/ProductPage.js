import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import s from './ProductPage.module.css';
export default function ProductPage() {
    const { slug } = useParams();
    const q = useQuery({
        queryKey: ['product', slug],
        enabled: !!slug,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, title, description, product_images(url, sort)')
                .eq('slug', slug)
                .single();
            if (error)
                throw error;
            return {
                ...data,
                product_images: (data.product_images ?? [])
                    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
            };
        },
    });
    if (q.isLoading) {
        return _jsx("div", { className: s.wrap, children: _jsx("div", { className: s.skel, children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" }) });
    }
    if (q.isError || !q.data) {
        return _jsx("div", { className: s.wrap, children: _jsx("div", { className: s.skel, children: "\u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" }) });
    }
    const p = q.data;
    const cover = p.product_images?.[0]?.url;
    // Текст для кнопок (можно подставить номер телефона/юзернейм)
    const msg = encodeURIComponent(`Здравствуйте! Интересует товар: ${p.title}`);
    const waHref = `https://wa.me/89141011645?text=${msg}`;
    // const tgHref = `https://t.me/share/url?url=${location.href}&text=${msg}`;
    return (_jsxs("div", { className: s.wrap, children: [_jsx(Link, { to: "/catalog", className: s.back, children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }), _jsxs("div", { className: s.card, children: [_jsx("div", { className: s.media, children: cover ? (_jsx("img", { src: cover, alt: p.title })) : (_jsx("div", { className: s.noimg, children: "\u041D\u0435\u0442 \u0444\u043E\u0442\u043E" })) }), _jsxs("div", { className: s.info, children: [_jsx("h1", { className: s.h1, children: p.title }), _jsx("p", { className: s.note, children: "\u0423\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u044B, \u043E \u043D\u0430\u043B\u0438\u0447\u0438\u0438 \u0442\u043E\u0432\u0430\u0440\u0430 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u0443\u0442\u043E\u0447\u043D\u044F\u0439\u0442\u0435 \u043F\u043E \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0443." }), _jsx("div", { className: s.actions, children: _jsxs("a", { className: s.btn, href: waHref, target: "_blank", rel: "noreferrer", children: [_jsxs("svg", { viewBox: "0 0 24 24", className: s.ic, "aria-hidden": true, children: [_jsx("path", { d: "M16.1 13.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.6.1s-.7.7-.8.9c-.1.2-.3.2-.5.1-1.3-.6-2.4-1.6-3.1-2.9-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.5.1-.7.3-.2.2-.7.7-.7 1.8s.8 2.1.9 2.2c.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.5.5.2 1 .2 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1-.2-.2-.2-.4-.3Z" }), _jsx("path", { d: "M12 2C6.5 2 2 6.2 2 11.3c0 1.8.5 3.6 1.5 5.1L2 22l5.8-1.5c1.4.8 3 .1 4.2.1 5.5 0 10-4.2 10-9.3S17.5 2 12 2Zm0 16.8c-1.2 0-2.3-.3-3.3-.8l-.2-.1-3.4.9.9-3.2-.2-.3c-.9-1.3-1.4-2.8-1.4-4.4C4.4 7 7.8 4 12 4s7.6 3 7.6 6.8-3.4 8-7.6 8Z" })] }), "\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0432 \u0412\u0430\u0442\u0441\u0430\u043F"] }) })] })] })] }));
}
