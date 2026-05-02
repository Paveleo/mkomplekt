import { useState } from 'react'
import { Link } from 'react-router-dom'
import Images from '@/images'
import { useAuth } from '@/auth/AuthProvider'
import { useCartItems, useCheckoutCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart'
import s from './CartPage.module.css'

function formatPrice(value: number | null) {
  if (typeof value !== 'number') {
    return 'Цена по запросу'
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CartPage() {
  const { user, loading } = useAuth()
  const { data: items = [], isLoading } = useCartItems()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const checkout = useCheckoutCart()
  const [comment, setComment] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')

  if (loading) {
    return (
      <div className={s.wrap}>
        <div className={s.message}>Загружаем корзину...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <section className={s.wrap}>
        <div className={s.emptyCard}>
          <p className={s.eyebrow}>Корзина</p>
          <h1 className={s.title}>Войдите, чтобы сохранить выбранные товары</h1>
          <p className={s.message}>
            Корзина доступна только для авторизованных пользователей и сохраняется в аккаунте.
          </p>
          <div className={s.actions}>
            <Link to="/auth?mode=login&redirect=%2Fcart" className={s.primary}>
              Войти
            </Link>
            <Link to="/auth?mode=register&redirect=%2Fcart" className={s.secondary}>
              Регистрация
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const pricedItems = items.filter((item) => typeof item.product.price === 'number')
  const totalPrice = pricedItems.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)

  const handleCheckout = async () => {
    setCheckoutMessage('')

    try {
      const result = await checkout.mutateAsync({ comment })
      setComment('')
      setCheckoutMessage(`Заказ ${result.ticket_number} создан и отправлен администратору.`)
    } catch (error: any) {
      if (error?.detail === 'CART_IS_EMPTY') {
        setCheckoutMessage('Нельзя оформить пустую корзину.')
        return
      }
      setCheckoutMessage(error?.message || 'Не удалось оформить заказ.')
    }
  }

  return (
    <section className={s.wrap}>
      <div className={s.hero}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>Корзина</p>
          <h1 className={s.title}>Товары, которые вы выбрали</h1>
          <p className={s.subtitle}>
            Проверьте состав корзины, скорректируйте количество и отправьте заказ менеджеру.
          </p>
        </div>

        <div className={s.summary}>
          <div className={s.summaryBlock}>
            <span className={s.summaryValue}>{totalCount}</span>
            <span className={s.summaryLabel}>позиций в корзине</span>
          </div>
          <div className={s.summaryDivider} />
          <div className={s.summaryBlock}>
            <span className={s.summaryPrice}>
              {pricedItems.length === items.length && items.length > 0
                ? formatPrice(totalPrice)
                : 'Есть товары без цены'}
            </span>
            <span className={s.summaryLabel}>предварительная сумма</span>
          </div>
        </div>
      </div>

      {isLoading ? <div className={s.message}>Обновляем корзину...</div> : null}

      {!isLoading && items.length === 0 ? (
        <div className={s.emptyCard}>
          <p className={s.message}>Корзина пуста. Добавьте товары из каталога.</p>
          <Link to="/catalog" className={s.primary}>
            Перейти в каталог
          </Link>
        </div>
      ) : null}

      {items.length ? (
        <div className={s.checkoutLayout}>
          <div className={s.list}>
            {items.map((item) => (
              <article key={item.id} className={s.item}>
                <Link to={`/products/${item.product.slug}`} className={s.thumbLink}>
                  <div className={s.thumb}>
                    <img src={item.product.images[0]?.url || Images.nofoto} alt={item.product.title} />
                  </div>
                </Link>

                <div className={s.itemBody}>
                  <Link to={`/products/${item.product.slug}`} className={s.itemTitle}>
                    {item.product.title}
                  </Link>
                  <div className={s.itemMeta}>
                    <span className={s.itemPrice}>{formatPrice(item.product.price)}</span>
                  </div>
                </div>

                <div className={s.controls}>
                  <div className={s.quantity}>
                    <button
                      type="button"
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      disabled={updateItem.isPending}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      disabled={updateItem.isPending}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={s.remove}
                    onClick={() => removeItem.mutate(item.id)}
                    disabled={removeItem.isPending}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className={s.orderCard}>
            <p className={s.orderEyebrow}>Оформление</p>
            <h2 className={s.orderTitle}>Отправить заказ менеджеру</h2>
            <p className={s.orderText}>
              После оформления корзина превратится в тикет для администратора. Он увидит состав
              заказа, ваши контакты и комментарий.
            </p>

            <label className={s.noteField}>
              <span>Комментарий к заказу</span>
              <textarea
                rows={5}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Например: удобное время звонка, пожелания по цвету или комплектации"
              />
            </label>

            <button
              type="button"
              className={s.primary}
              onClick={handleCheckout}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? 'Отправляем...' : 'Оформить заказ'}
            </button>

            {checkoutMessage ? (
              <div className={`${s.notice} ${checkout.isError ? s.noticeError : ''}`}>
                {checkoutMessage}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  )
}
