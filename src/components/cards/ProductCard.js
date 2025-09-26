import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import s from './ProductCard.module.css';
export default function ProductCard({ item }) {
    const cover = item.images?.[0]?.url;
    return (_jsxs(Link, { to: `/products/${item.slug}`, className: s.card, children: [_jsx("div", { className: s.thumb, children: cover ? _jsx("img", { src: cover, alt: item.title }) : _jsx("div", { style: { opacity: .6 }, children: "\u041D\u0435\u0442 \u0444\u043E\u0442\u043E" }) }), _jsx("div", { className: s.title, children: item.title })] }));
}
