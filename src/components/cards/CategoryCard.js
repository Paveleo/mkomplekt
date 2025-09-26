import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import s from './CategoryCard.module.css';
export default function CategoryCard({ item, to }) {
    const href = to ?? `/catalog/${item.slug}`;
    return (_jsxs(Link, { to: href, className: s.card, children: [_jsx("div", { className: s.media, children: _jsx("img", { src: item.image_url || 'https://placehold.co/600x400', alt: item.title }) }), _jsx("div", { className: s.caption, children: item.title })] }));
}
