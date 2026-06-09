import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/auth/AuthProvider';
import { useAddToCart } from '@/hooks/useCart';
import styles from './ProductPage.module.css';

type ProductDetails = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price?: number | null;
  size?: string | null;
  thickness?: number | null;
  color?: string | null;
  unit?: string | null;
  material?: string | null;
  product_images: { url: string; sort: number }[];
};

function formatPrice(value: number | null) {
  if (typeof value !== 'number') {
    return 'Цена по запросу';
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToCart = useAddToCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cartNotice, setCartNotice] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const query = useQuery({
    queryKey: ['product', slug],
    enabled: !!slug,
    queryFn: async () => apiRequest<ProductDetails>(`/api/catalog/products/${slug}`),
  });

  useEffect(() => {
    setActiveImageIndex(0);
  }, [query.data?.id]);

  if (query.isLoading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.skel}>Загрузка товара...</div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className={styles.wrap}>
        <div className={styles.skel}>Товар не найден.</div>
      </div>
    );
  }

  const product = query.data;
  const images = product.product_images || [];
  const activeImage = images[activeImageIndex]?.url || images[0]?.url || null;
  const specs = [
    product.size ? { label: 'Размер', value: product.size } : null,
    typeof product.thickness === 'number' ? { label: 'Толщина', value: `${product.thickness} мм` } : null,
    product.color ? { label: 'Цвет', value: product.color } : null,
    product.unit ? { label: 'Ед. измерения', value: product.unit } : null,
    product.material ? { label: 'Материал', value: product.material } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const phone = '79141011645';
  const text = `Здравствуйте! Интересует товар: ${product.title}`;
  const encodedMessage = encodeURIComponent(text);

  const waDeep = `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
  const waHttp = `https://wa.me/${phone}?text=${encodedMessage}`;
  const waWeb = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;

  function openWhatsApp(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const isInAppWebView = /(FBAN|FBAV|Instagram|Line|VKClient|OkApp|Telegram)/i.test(userAgent);

    if (isMobile) {
      if (isInAppWebView) {
        window.location.href = waHttp;
        return;
      }

      window.location.href = waDeep;

      setTimeout(() => {
        window.location.href = waHttp;
      }, 800);
      return;
    }

    window.open(waWeb, '_blank', 'noopener');
  }

  const handleAddToCart = async () => {
    setCartNotice(null);

    if (!user) {
      navigate(`/auth?mode=register&redirect=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      setCartNotice({ text: 'Товар добавлен в корзину.', tone: 'success' });
    } catch (error: any) {
      setCartNotice({
        text: error.message || 'Не удалось добавить товар в корзину.',
        tone: 'error',
      });
    }
  };

  return (
    <div className={styles.wrap}>
      <Link to="/catalog" className={styles.back}>← Назад в каталог</Link>

      <div className={styles.card}>
        <div className={styles.gallery}>
          <div className={styles.media}>
            {activeImage ? (
              <img src={activeImage} alt={product.title} />
            ) : (
              <div className={styles.noimg}>Нет фото</div>
            )}
          </div>

          {images.length > 1 ? (
            <div className={styles.thumbs}>
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  className={`${styles.thumbButton} ${index === activeImageIndex ? styles.thumbButtonActive : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Показать фото ${index + 1}`}
                >
                  <img src={image.url} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.info}>
          <h1 className={styles.h1}>{product.title}</h1>
          <div className={styles.price}>{formatPrice(product.price ?? null)}</div>

          <p className={styles.note}>
            Уточняйте наличие товара и финальную стоимость у менеджера перед оформлением заказа.
          </p>

          {specs.length > 0 ? (
            <dl className={styles.specs}>
              {specs.map((spec) => (
                <div className={styles.specRow} key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {product.description ? <p className={styles.description}>{product.description}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btn}
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              {addToCart.isPending ? 'Добавляем...' : 'Добавить в корзину'}
            </button>

            <a className={`${styles.btn} ${styles.btnGhost}`} href={waHttp} onClick={openWhatsApp} rel="noopener">
              Написать в WhatsApp
            </a>
          </div>

          {cartNotice ? (
            <div className={`${styles.cartMessage} ${cartNotice.tone === 'error' ? styles.cartMessageError : ''}`}>
              <span>{cartNotice.text}</span>
              {user ? <Link to="/cart">Открыть корзину</Link> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
