import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import s from './USP.module.css';
const steps = [
    {
        no: 1,
        title: 'От идеи до концепции',
        text: 'Обсудим ваш проект, учтём все детали и предложим функциональный дизайн.',
    },
    {
        no: 2,
        title: 'Проработка и согласование',
        text: 'Уточним материалы, доработаем макет и утвердим финальный вариант.',
    },
    {
        no: 3,
        title: 'Производство и сборка под ключ',
        text: 'Изготовим, упакуем, доставим и аккуратно соберём мебель на месте.',
    },
];
export default function USP() {
    return (_jsx("section", { className: s.wrap, children: _jsx("div", { className: s.grid, children: steps.map((it) => (_jsxs("article", { className: s.card, children: [_jsxs("div", { className: s.no, children: ["No. ", it.no] }), _jsx("h3", { className: s.title, children: it.title }), _jsx("p", { className: s.text, children: it.text })] }, it.no))) }) }));
}
