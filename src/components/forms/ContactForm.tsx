import { useForm } from 'react-hook-form';
import emailjs from 'emailjs-com';
import s from './ContactForm.module.css';

export default function ContactForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    emailjs
      .send(
        'service_li98da2',   
        'template_ofyprfe',  
        data,
        'bYe0R7ivoEnRawCVX'    
      )
      .then(
        (result) => {
          console.log('Сообщение отправлено:', result.text);
          reset();
        },
        (error) => {
          console.error('Ошибка отправки:', error.text);
        }
      );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
      <input
        className={s.input}
        placeholder="Имя"
        {...register('name', { required: true })}
      />
      <input
        className={s.input}
        placeholder="Email"
        type="email"
        {...register('email', { required: true })}
      />
      <input
        className={s.input}
        placeholder="Телефон"
        {...register('phone')}
      />
      <textarea
        className={s.textarea}
        placeholder="Комментарий"
        rows={5}
        {...register('message')}
      />
      <button type="submit" className={s.btn}>
        Оставить Заявку
      </button>
    </form>
  );
}
