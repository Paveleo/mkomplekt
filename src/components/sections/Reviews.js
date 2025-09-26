import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import s from './Reviews.module.css';
import Images from '../../images';
const items = [
    {
        name: 'Туйаара Пермякова',
        email: 'tuyaara.perm@gmail.com',
        avatar: Images.Ava,
        image: Images.Slider1,
        text: [
            'Очень долго не могла найти мебель, которая сочетала бы в себе стиль, качество и уют. Здесь всё совпало с первого касания — от общения до финального результата. Ребята учли каждую мелочь: цвет, материалы, даже освещение в комнате.',
            'Получилось не просто красиво, а живое пространство, в котором хочется быть. Спасибо за тёплый подход и настоящую любовь к своему делу.',
        ],
    },
    // добавляй остальные отзывы таким же образом
];
export default function Reviews() {
    const [i, setI] = useState(0);
    const cur = items[i];
    const prev = () => setI((v) => (v - 1 + items.length) % items.length);
    const next = () => setI((v) => (v + 1) % items.length);
    // стрелки с клавиатуры
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowLeft')
                prev();
            if (e.key === 'ArrowRight')
                next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    return (_jsxs("section", { className: s.wrap, children: [_jsx("h2", { className: s.h2, children: "\u041E\u0442\u0437\u044B\u0432\u044B \u041D\u0430\u0448\u0438\u0445 \u041A\u043B\u0438\u0435\u043D\u0442\u043E\u0432" }), _jsxs("div", { className: s.grid, children: [_jsxs("div", { className: s.left, children: [_jsxs("div", { className: s.author, children: [_jsx("img", { className: s.avatar, src: cur.avatar, alt: cur.name }), _jsxs("div", { children: [_jsx("div", { className: s.name, children: cur.name }), _jsx("div", { className: s.email, children: cur.email })] })] }), _jsx("div", { className: s.photo, children: _jsx("img", { src: cur.image, alt: cur.name }) })] }), _jsxs("div", { className: s.right, children: [cur.text.map((p, idx) => (_jsx("p", { className: s.p, children: p }, idx))), _jsxs("div", { className: s.controls, children: [_jsx("button", { className: s.navBtn, onClick: prev, "aria-label": "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439", children: "\uFE64" }), _jsxs("div", { className: s.counter, children: [_jsx("span", { className: s.cur, children: i + 1 }), _jsx("span", { className: s.line }), _jsx("span", { className: s.total, children: items.length })] }), _jsx("button", { className: s.navBtn, onClick: next, "aria-label": "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439", children: "\uFE65" })] })] })] })] }));
}
