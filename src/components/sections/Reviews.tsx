import { useEffect, useState } from 'react';
import s from './Reviews.module.css';
import Images from '../../images';

type Item = {
  name: string;
  email: string;
  avatar: string;
  image: string;
  text: string[];
};

const items: Item[] = [
  {
    name: 'Туйаара Пермякова',
    email: 'tuyaara.perm@gmail.com',
    avatar: Images.Ava, 
    image:  Images.Slider1,
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className={s.wrap}>
      <h2 className={s.h2}>Отзывы Наших Клиентов</h2>

      <div className={s.grid}>
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className={s.left}>
          <div className={s.author}>
            <img className={s.avatar} src={cur.avatar} alt={cur.name} />
            <div>
              <div className={s.name}>{cur.name}</div>
              <div className={s.email}>{cur.email}</div>
            </div>
          </div>

          <div className={s.photo}>
            <img src={cur.image} alt={cur.name} />
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className={s.right}>
          {cur.text.map((p, idx) => (
            <p className={s.p} key={idx}>{p}</p>
          ))}

          <div className={s.controls}>
            <button className={s.navBtn} onClick={prev} aria-label="Предыдущий">﹤</button>

            <div className={s.counter}>
              <span className={s.cur}>{i + 1}</span>
              <span className={s.line} />
              <span className={s.total}>{items.length}</span>
            </div>

            <button className={s.navBtn} onClick={next} aria-label="Следующий">﹥</button>
          </div>
        </div>
      </div>
    </section>
  );
}
