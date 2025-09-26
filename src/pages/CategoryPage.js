import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, Link } from 'react-router-dom';
import { useChildrenCategories } from '@/hooks/useCategories';
import { useProductsByCategorySlug } from '@/hooks/useProducts';
import CategoryCard from '@/components/cards/CategoryCard';
import ProductCard from '@/components/cards/ProductCard';
import s from './CategoryPage.module.css';
export default function CategoryPage() {
    const { category } = useParams();
    const { data: children } = useChildrenCategories(category);
    const isLeaf = (children?.length ?? 0) === 0;
    const { data: products } = useProductsByCategorySlug(isLeaf ? category : '');
    return (_jsxs("div", { className: s.wrap, children: [_jsx(Link, { to: "/catalog", className: s.back, children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }), !isLeaf ? (_jsxs(_Fragment, { children: [_jsx("h1", { className: s.title, children: "\u041F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), _jsx("div", { className: s.grid, children: children?.map((c) => (_jsx(CategoryCard, { item: c, to: `/catalog/${category}/${c.slug}` }, c.id))) })] })) : (_jsxs(_Fragment, { children: [_jsx("h1", { className: s.title, children: "\u0422\u043E\u0432\u0430\u0440\u044B" }), _jsx("div", { className: s.grid, children: products?.map((p) => (_jsx(ProductCard, { item: { id: p.id, slug: p.slug, title: p.title, images: p.images } }, p.id))) })] }))] }));
}
