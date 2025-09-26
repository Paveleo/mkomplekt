
import s from './CTA.module.css';
import Images from '../../images'; 

type Props = {
    image?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
};

export default function CTA({
    image = Images?.KitchenCTA,
    title = 'Купите Сейчас Премиальное Качество',
    subtitle = 'Обновите свой интерьер стильной и удобной мебелью. Найдите идеальную мебель прямо сейчас.',
    ctaText = 'Оставить Заявку',
    ctaHref = '/contacts',
}: Props) {
return (
    <section className={s.wrap}>
        <img className={s.bg} src={image} alt="" />
        <div className={s.overlay} />
        <div className={s.inner}>
            <div className={s.left}>
            <h2 className={s.title}>{title}</h2>
            <p className={s.text}>{subtitle}</p>
        </div>

        <a className={s.cta} href={ctaHref}>{ctaText}</a>
        </div>
    </section>
);
}
