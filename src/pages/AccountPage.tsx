import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { useCartCount } from '@/hooks/useCart'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import s from './AccountPage.module.css'

export default function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: cartCount = 0 } = useCartCount()
  const updateProfile = useUpdateProfile()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setFullName(profile?.full_name ?? user?.full_name ?? '')
    setPhone(profile?.phone ?? '')
  }, [profile, user?.full_name])

  if (loading) {
    return (
      <div className={s.wrap}>
        <div className={s.card}>Загружаем кабинет...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <section className={s.wrap}>
        <div className={s.emptyCard}>
          <p className={s.eyebrow}>Личный кабинет</p>
          <h1 className={s.title}>Войдите, чтобы сохранить корзину и свои данные</h1>
          <p className={s.text}>
            После входа вы сможете редактировать контактную информацию и быстрее оформлять заявки.
          </p>
          <div className={s.actions}>
            <Link to="/auth?mode=login&redirect=%2Faccount" className={s.primary}>
              Войти
            </Link>
            <Link to="/auth?mode=register&redirect=%2Faccount" className={s.secondary}>
              Регистрация
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    try {
      await updateProfile.mutateAsync({ full_name: fullName, phone })
      setMessage('Профиль сохранён.')
    } catch {
      // Ошибка уже отражается через состояние mutation.
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <section className={s.wrap}>
      <div className={s.hero}>
        <div className={s.heroMain}>
          <p className={s.eyebrow}>Личный кабинет</p>
          <h1 className={s.title}>{fullName || 'Покупатель'}</h1>
          <p className={s.text}>{user.email}</p>
        </div>

        <div className={s.heroAside}>
          <div className={s.statCard}>
            <span className={s.statValue}>{cartCount}</span>
            <span className={s.statLabel}>товаров в корзине</span>
          </div>
          <Link to="/cart" className={s.primary}>
            Открыть корзину
          </Link>
        </div>
      </div>

      <div className={s.grid}>
        <div className={s.card}>
          <h2 className={s.sectionTitle}>Контактные данные</h2>

          <form className={s.form} onSubmit={handleSave}>
            <label className={s.field}>
              <span>Имя</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>

            <label className={s.field}>
              <span>Телефон</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 (___) ___-__-__"
              />
            </label>

            {updateProfile.isError ? (
              <div className={s.error}>Не удалось сохранить профиль.</div>
            ) : null}

            {message ? <div className={s.message}>{message}</div> : null}

            <button className={s.primary} type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </form>
        </div>

        <div className={s.card}>
          <h2 className={s.sectionTitle}>Быстрые действия</h2>

          <div className={s.quickGrid}>
            <Link to="/catalog" className={s.quickCard}>
              <span className={s.quickLabel}>Каталог</span>
              <strong className={s.quickTitle}>Перейти к товарам и разделам</strong>
            </Link>

            <Link to="/contacts" className={s.quickCard}>
              <span className={s.quickLabel}>Связь</span>
              <strong className={s.quickTitle}>Оставить заявку менеджеру</strong>
            </Link>
          </div>

          <button type="button" className={s.exit} onClick={handleSignOut}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </section>
  )
}
