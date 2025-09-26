import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import s from './CTA.module.css';
import Images from '../../images';
export default function CTA({ image = Images?.KitchenCTA, title = 'Купите Сейчас Премиальное Качество', subtitle = 'Обновите свой интерьер стильной и удобной мебелью. Найдите идеальную мебель прямо сейчас.', ctaText = 'Оставить Заявку', ctaHref = '/contacts', }) {
    return (_jsxs("section", { className: s.wrap, children: [_jsx("img", { className: s.bg, src: image, alt: "" }), _jsx("div", { className: s.overlay }), _jsxs("div", { className: s.inner, children: [_jsxs("div", { className: s.left, children: [_jsx("h2", { className: s.title, children: title }), _jsx("p", { className: s.text, children: subtitle })] }), _jsx("a", { className: s.cta, href: ctaHref, children: ctaText })] })] }));
}
