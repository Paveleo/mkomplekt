import Images from '../images';
import s from './AboutPage.module.css';

function AboutText() {
  return (
    <p className={s.lead}>
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

    </section>
  );
}
