import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import emailjs from 'emailjs-com';
import s from './ContactForm.module.css';
export default function ContactForm() {
    const { register, handleSubmit, reset } = useForm();
    const onSubmit = (data) => {
        emailjs
            .send('service_li98da2', 'template_ofyprfe', data, 'bYe0R7ivoEnRawCVX')
            .then((result) => {
            console.log('Сообщение отправлено:', result.text);
            reset();
        }, (error) => {
            console.error('Ошибка отправки:', error.text);
        });
    };
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: s.form, children: [_jsx("input", { className: s.input, placeholder: "\u0418\u043C\u044F", ...register('name', { required: true }) }), _jsx("input", { className: s.input, placeholder: "Email", type: "email", ...register('email', { required: true }) }), _jsx("input", { className: s.input, placeholder: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D", ...register('phone') }), _jsx("textarea", { className: s.textarea, placeholder: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", rows: 5, ...register('message') }), _jsx("button", { type: "submit", className: s.btn, children: "\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0417\u0430\u044F\u0432\u043A\u0443" })] }));
}
