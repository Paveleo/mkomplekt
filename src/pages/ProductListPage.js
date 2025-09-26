import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, Link } from 'react-router-dom';
import { useProductsByCategorySlug } from '@/hooks/useProducts';
import ProductCard from '@/components/cards/ProductCard';
import s from './ProductListPage.module.css';
export default function ProductListPage() {
    const { sub } = useParams();
    const { data } = useProductsByCategorySlug(sub);
    return (_jsxs("div", { className: s.wrap, children: [_jsx(Link, { to: "/catalog", className: s.back, children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }), _jsx("h1", { className: s.title, children: "\u0422\u043E\u0432\u0430\u0440\u044B" }), (!data || data.length === 0) ? (_jsx("div", { className: s.empty, children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u044D\u0442\u043E\u0439 \u043F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438." })) : (_jsx("div", { className: "grid", style: { gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }, children: data?.map((p) => (_jsx(ProductCard, { item: p }, p.id))) }))] }));
}
