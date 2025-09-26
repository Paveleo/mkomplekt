import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import CategoryCard from '@/components/cards/CategoryCard';
import { useRootCategories } from '@/hooks/useCategories';
import s from './CatalogGrid.module.css';
export default function CatalogGrid() {
    const { data } = useRootCategories();
    if (!data)
        return null;
    return (_jsxs("section", { className: s.wrap, children: [_jsxs("div", { className: s.left, children: [_jsxs("h2", { className: s.title, children: ["\u041D\u0430\u0448", _jsx("br", {}), "\u041A\u0430\u0442\u0430\u043B\u043E\u0433"] }), _jsxs("div", { className: s.leftCards, children: [data[0] && _jsx(CategoryCard, { item: data[0] }), data[1] && _jsx(CategoryCard, { item: data[1] })] })] }), _jsxs("div", { className: s.right, children: [data[2] && _jsx(CategoryCard, { item: data[2] }), data[3] && _jsx(CategoryCard, { item: data[3] })] }), _jsx("div", { className: s.moreWrap, children: _jsx(Link, { className: s.moreBtn, to: "/catalog", children: "\u0415\u0449\u0451" }) })] }));
}
