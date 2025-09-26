import Images from '../images';
import s from './AboutPage.module.css';

function AboutText() {
  return (
    <p className={s.lead}>
      <span className={s.hl}>Мы верим</span>, что мебель — это больше, чем функциональность.
      Это атмосфера, в которой просыпаешься, строишь планы,
      <span className={s.hl}> обнимаешь близких</span> и просто живёшь. Именно поэтому каждое
      изделие мы создаём с <span className={s.hl}>вниманием, любовью</span> и пониманием, что
      настоящий дом начинается <span className={s.hl}>с деталей</span>.
    </p>
  );
}

type RowProps = { img: string; reverse?: boolean };
function Row({ img, reverse }: RowProps) {
  return (
    <div className={`${s.row} ${reverse ? s.reverse : ''}`}>
      {!reverse ? (
        <>
          <div className={s.textCol}><AboutText /></div>
          <div className={s.mediaCol}><img src={img} alt="" /></div>
        </>
      ) : (
        <>
          <div className={s.mediaCol}><img src={img} alt="" /></div>
          <div className={s.textCol}><AboutText /></div>
        </>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <section className={s.wrap}>
      <h1 className={s.h1}>О Нас</h1>

      {/* 1: текст слева, фото справа */}
      <Row img={Images.About1} />

      {/* 2: фото слева, текст справа */}
      <Row img={Images.About2} reverse />

      {/* 3: текст слева, фото справа */}
      <Row img={Images.About3} />
    </section>
  );
}
