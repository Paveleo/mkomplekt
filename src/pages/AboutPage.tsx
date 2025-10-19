import Images from '../images';
import s from './AboutPage.module.css';

function AboutText() {
  return (
    <p className={s.lead}>
      <span className={s.hl}>Мы — динамично развивающаяся компания,</span>специализирующаяся на производстве корпусной мебели, пленочных фасадов, а также реализации материалов и комплектующих. Сегодня мы являемся крупнейшим поставщиком мебельных материалов и фурнитуры в
      <br />
      <span className={s.hl}>Республике Саха (Якутия).</span>
    </p>
  );
}
function AboutText2() {
  return (
    <p className={s.lead}>
      В нашем распоряжении <span className={s.hl}>собственные производственные цеха,</span> оснащённые современными станками и оборудованием. За качество отвечают опытные мастера и проектировщики, что позволяет реализовывать проекты любой сложности и поддерживать <span className={s.hl}>высокие стандарты.</span>
    </p>
  );
}
function AboutText3() {
  return (
    <p className={s.lead}>
      Мы успешно работаем на рынке более <span className={s.hl}>10 лет</span> и за это время завоевали доверие тысяч клиентов. Наша миссия — создавать комфортные и красивые интерьеры, <span className={s.hl}>принося радость и удовлетворение каждому заказчику.</span>
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

function Row2({ img, reverse }: RowProps) {
  return (
    <div className={`${s.row} ${reverse ? s.reverse : ''}`}>
      {!reverse ? (
        <>
          <div className={s.textCol}><AboutText2 /></div>
          <div className={s.mediaCol}><img src={img} alt="" /></div>
        </>
      ) : (
        <>
          <div className={s.mediaCol}><img src={img} alt="" /></div>
          <div className={s.textCol}><AboutText2 /></div>
        </>
      )}
    </div>
  );
}
function Row3({ img, reverse }: RowProps) {
  return (
    <div className={`${s.row} ${reverse ? s.reverse : ''}`}>
      {!reverse ? (
        <>
          <div className={s.textCol}><AboutText3 /></div>
          <div className={s.mediaCol}><img src={img} alt="" /></div>
        </>
      ) : (
        <>
          <div className={s.mediaCol}><img src={img} alt="" /></div>
          <div className={s.textCol}><AboutText3 /></div>
        </>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <section className={s.wrap}>
      <h1 className={s.h1}>О Нас</h1>

      <Row img={Images.About1} />

      <Row2 img={Images.About2} reverse />

      <Row3 img={Images.About3} />
    </section>
  );
}
