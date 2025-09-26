import s from './AboutSplit.module.css';
import { Link } from 'react-router-dom';
import Images from '../../images'

export default function AboutSplit() {
  return (
    <section className={s.wrap}>
      <div className={s.textCol}>
        <p className={s.lead}>
          <span className={s.hl}>Мы верим</span>, что мебель — это больше, чем функциональность.
          Это атмосфера, в которой просыпаешься, строишь планы,
          <span className={s.hl}> обнимаешь близких</span> и просто живёшь. Именно поэтому каждое
          изделие мы создаём с <span className={s.hl}>вниманием, любовью</span> и пониманием, что
          настоящий дом начинается <span className={s.hl}>с деталей</span>.
        </p>

        <Link className={s.btn} to="/about">Подробнее</Link>
      </div>

      <div className={s.mediaCol}>
        <img src={Images.AboutSplitIMG}/>
      </div>
    </section>
  );
}
