import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CategoryCard from '@/components/cards/CategoryCard';
import { useRootCategories } from '@/hooks/useCategories';
import s from './CatalogPage.module.css';
function NoteTile() {
    return (_jsxs("div", { className: s.note, children: [_jsxs("p", { className: s.noteLg, children: ["\u0422\u0430\u043C, \u0433\u0434\u0435 ", _jsx("u", { children: "\u0441\u0442\u0438\u043B\u044C \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u0442 \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C" })] }), _jsxs("p", { className: s.noteSm, children: ["\u0411\u043E\u043B\u044C\u0448\u0435, \u0447\u0435\u043C \u043C\u0435\u0431\u0435\u043B\u044C \u2014 ", _jsx("u", { children: "\u0432\u0430\u0448\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E" }), "."] })] }));
}
export default function CatalogPage() {
    const { data } = useRootCategories();
    const cards = (data ?? []).slice(0, 7);
    const mojkiIndex = cards.findIndex((c) => {
        const t = (c?.title || '').toLowerCase();
        const s = (c?.slug || '').toLowerCase();
        return t.includes('мойки') || s.includes('mojki') || s.includes('sink') || s.includes('sinks');
    });
    const insertAt = mojkiIndex >= 0 ? mojkiIndex + 1 : Math.min(cards.length, 6);
    const withNote = [...cards];
    withNote.splice(insertAt, 0, { _type: 'note' });
    return (_jsxs("section", { className: s.wrap, children: [_jsxs("h1", { className: s.title, children: ["\u041D\u0430\u0448", _jsx("br", {}), "\u041A\u0430\u0442\u0430\u043B\u043E\u0433"] }), _jsx("div", { className: s.grid, children: withNote.map((item, idx) => {
                    if (item?._type === 'note') {
                        return (_jsx("div", { className: `${s.cell} ${s.cellShort}`, children: _jsx(NoteTile, {}) }, `note-${idx}`));
                    }
                    return (_jsx("div", { className: `${s.cell} ${idx < 4 ? s.cellTall : s.cellShort}`, children: _jsx(CategoryCard, { item: item }) }, item.id));
                }) })] }));
}
