import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import s from './ProductPage.module.css';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  const q = useQuery({
    queryKey: ['product', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, product_images(url, sort)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return {
        ...data,
        product_images: (data.product_images ?? [])
          .sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0)),
      };
    },
  });

  if (q.isLoading) {
    return <div className={s.wrap}><div className={s.skel}>Загрузка…</div></div>;
  }
  if (q.isError || !q.data) {
    return <div className={s.wrap}><div className={s.skel}>Товар не найден</div></div>;
  }

  const p = q.data as any;
  const cover = p.product_images?.[0]?.url;

  const phone = '79141011645';
  const text = `Здравствуйте! Интересует товар: ${p.title}`;
  const enc = encodeURIComponent(text);

  const waDeep = `whatsapp://send?phone=${phone}&text=${enc}`;
  const waHttp = `https://wa.me/${phone}?text=${enc}`;
  const waWeb  = `https://web.whatsapp.com/send?phone=${phone}&text=${enc}`;

  function openWhatsApp(e) {
    e.preventDefault();

    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const isInAppWebView = /(FBAN|FBAV|Instagram|Line|VKClient|OkApp|Telegram)/i.test(ua);

    if (isMobile) {
      if (isInAppWebView) {
        window.location.href = waHttp;
        return;
      }

      window.location.href = waDeep;

      setTimeout(() => {
        window.location.href = waHttp;
      }, 800);
    } else {
      window.open(waWeb, '_blank', 'noopener');
    }
  }

                     
  // const tgHref = `https://t.me/share/url?url=${location.href}&text=${msg}`;

  return (
    <div className={s.wrap}>
      <Link to="/catalog" className={s.back}>← Назад</Link>

      <div className={s.card}>
        <div className={s.media}>
          {cover ? (
            <img src={cover} alt={p.title} />
          ) : (
            <div className={s.noimg}>Нет фото</div>
          )}
        </div>

        <div className={s.info}>
          <h1 className={s.h1}>{p.title}</h1>

          <p className={s.note}>
            Уважаемые клиенты, о наличии товара на складе уточняйте по телефону.
          </p>

          <div className={s.actions}>
            <a className={s.btn} href={waHttp} onClick={openWhatsApp} rel="noopener">
              Написать в Ватсап
            </a>



            {/* <a className={s.btn} href={tgHref} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" className={s.ic} aria-hidden>
                <path d="M9.3 15.3 9 19.9c.5 0 .7-.2.9-.4l2.2-2.1 4.6 3.3c.8.4 1.4.2 1.6-.7l2.9-13.6c.3-1.2-.5-1.7-1.3-1.4L2.7 9.5C1.5 10 1.5 10.7 2.5 11l4.8 1.5L18.8 6c.6-.4 1.1-.2.7.2L9.3 15.3Z"/>
              </svg>
              Написать в Телеграм
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
}
