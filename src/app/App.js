import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import s from './AppShell.module.css';
export default function App() {
    const { pathname } = useLocation();
    const onHero = pathname === '/';
    const ctaBlack = pathname.startsWith('/catalog') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/contacts') ||
        pathname.startsWith('/products');
    return (_jsxs("div", { className: s.shell, children: [_jsx(Header, { onHero: onHero, ctaBlack: ctaBlack }), _jsx("main", { className: s.main, children: _jsx(Outlet, {}) }), _jsx(Footer, {})] }));
}
