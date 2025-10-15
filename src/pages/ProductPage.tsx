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

  const msg = encodeURIComponent(`Здравствуйте! Интересует товар: ${p.title}`);
  const waHref = `https://api.whatsapp.com/send?phone=79141011645&text=${msg}`;
                     
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
            <a className={s.btn} href={waHref} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" className={s.ic} aria-hidden>
                <path d="M16.1 13.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.6.1s-.7.7-.8.9c-.1.2-.3.2-.5.1-1.3-.6-2.4-1.6-3.1-2.9-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.5.1-.7.3-.2.2-.7.7-.7 1.8s.8 2.1.9 2.2c.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.5.5.2 1 .2 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1-.2-.2-.2-.4-.3Z" />
                <path d="M12 2C6.5 2 2 6.2 2 11.3c0 1.8.5 3.6 1.5 5.1L2 22l5.8-1.5c1.4.8 3 .1 4.2.1 5.5 0 10-4.2 10-9.3S17.5 2 12 2Zm0 16.8c-1.2 0-2.3-.3-3.3-.8l-.2-.1-3.4.9.9-3.2-.2-.3c-.9-1.3-1.4-2.8-1.4-4.4C4.4 7 7.8 4 12 4s7.6 3 7.6 6.8-3.4 8-7.6 8Z" />
              </svg>
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
