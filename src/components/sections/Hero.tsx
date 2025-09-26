
import Images from '@/images';
import s from './Hero.module.css';

export default function Hero(){
  return (
    <section
      className={s.hero}
      style={{ backgroundImage: `url(${Images.Hero_bg})` }}
    >
      <div className={s.container}>
        <h1 className={s.hh1}>Индивидуальная мебель, созданная с душой</h1>
        <p className={s.pp}>Мы изготавливаем корпусную мебель, реализуем материалы, фурнитуру и комплектующие к ним. Сотрудничаем с различными мировыми брендами</p>
      </div>
    </section>
  );
}
