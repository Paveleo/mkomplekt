import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import s from './Header.module.css';
export default function Header({ onHero = false, ctaBlack = false }) {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(v => !v);
    const close = () => setOpen(false);
    return (_jsxs("header", { className: `${s.header} ${onHero ? s.onHero : ''} ${open ? s.open : ''}`, children: [_jsx("div", { className: s.inner, children: _jsxs("div", { className: s.row, children: [_jsx(Link, { className: s.logo, to: "/", onClick: close, children: "\u041C\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442." }), _jsxs("nav", { className: s.nav, onClick: close, children: [_jsx(NavLink, { to: "/", children: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" }), _jsx(NavLink, { to: "/catalog", children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" }), _jsx(NavLink, { to: "/about", children: "\u041E \u041D\u0430\u0441" }), _jsx(NavLink, { to: "/contacts", children: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B" })] }), _jsx(Link, { to: "/contacts", className: `${s.cta} ${ctaBlack ? s.ctaBlack : s.ctaWhite}`, onClick: close, children: "\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0417\u0430\u044F\u0432\u043A\u0443" }), _jsx("button", { className: s.burger, "aria-label": open ? 'Закрыть меню' : 'Открыть меню', "aria-expanded": open, onClick: toggle })] }) }), _jsx("div", { className: s.scrim, onClick: close })] }));
}
