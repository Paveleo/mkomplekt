import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { useCartCount } from '@/hooks/useCart'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import s from './AccountPage.module.css'

const sakhaDistricts = [
  'Городской округ Якутск',
  'Городской округ Жатай',
  'Абыйский район',
  'Алданский район',
  'Аллаиховский район',
  'Амгинский район',
  'Анабарский улус',
  'Булунский улус',
  'Верхневилюйский улус',
  'Верхнеколымский улус',
  'Верхоянский район',
  'Вилюйский улус',
  'Горный улус',
  'Жиганский улус',
  'Кобяйский улус',
  'Ленский район',
  'Мегино-Кангаласский улус',
  'Мирнинский район',
  'Момский район',
  'Намский улус',
  'Нерюнгринский район',
  'Нижнеколымский район',
  'Нюрбинский район',
  'Оймяконский улус',
  'Оленекский эвенкийский национальный район',
  'Олекминский район',
  'Среднеколымский улус',
  'Сунтарский улус',
  'Таттинский улус',
  'Томпонский район',
  'Усть-Алданский улус',
  'Усть-Майский улус',
  'Усть-Янский улус',
  'Хангаласский улус',
  'Чурапчинский улус',
  'Эвено-Бытантайский национальный улус',
]

function normalizePhoneInput(value: string) {
  const digits = value.replace(/\D+/g, '')
  if (!digits) {
    return ''
  }
  if (digits.startsWith('8')) {
    return `+7${digits.slice(1, 11)}`
  }
  if (digits.startsWith('7')) {
    return `+${digits.slice(0, 11)}`
  }
  return `+7${digits.slice(0, 10)}`
}

function isValidRussianMobilePhone(value: string) {
  return /^\+79\d{9}$/.test(value)
}

function getProfileErrorMessage(error: unknown) {
  const detail = (error as { detail?: string; message?: string } | null)?.detail

  if (detail === 'PHONE_ALREADY_EXISTS') {
    return 'Этот телефон уже привязан к другому аккаунту.'
  }
  if (detail === 'INVALID_PHONE') {
    return 'Введите действующий российский мобильный номер в формате +7XXXXXXXXXX.'
  }
  if (detail === 'INVALID_DISTRICT') {
    return 'Выберите район или городской округ Республики Саха (Якутия).'
  }
  if (detail === 'FULL_NAME_REQUIRED') {
    return 'Введите ФИО.'
  }
  if (detail === 'CITY_REQUIRED') {
    return 'Введите город или населенный пункт.'
  }

  return 'Не удалось сохранить профиль. Проверьте заполнение полей.'
}

export default function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: cartCount = 0 } = useCartCount()
  const updateProfile = useUpdateProfile()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    setFullName(profile?.full_name ?? user?.full_name ?? '')
    setPhone(profile?.phone ?? user?.phone ?? '')
    setDistrict(profile?.district ?? user?.district ?? '')
    setCity(profile?.city ?? user?.city ?? '')
  }, [profile, user])

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
    setLocalError('')

    const trimmedFullName = fullName.trim()
    const normalizedPhone = normalizePhoneInput(phone)
    const trimmedCity = city.trim()

    if (!trimmedFullName) {
      setLocalError('Введите ФИО.')
      return
    }
    if (!isValidRussianMobilePhone(normalizedPhone)) {
      setLocalError('Введите действующий российский мобильный номер в формате +7XXXXXXXXXX.')
      return
    }
    if (!district) {
      setLocalError('Выберите район или городской округ Республики Саха (Якутия).')
      return
    }
    if (!trimmedCity) {
      setLocalError('Введите город или населенный пункт.')
      return
    }

    try {
      await updateProfile.mutateAsync({
        full_name: trimmedFullName,
        phone: normalizedPhone,
        district,
        city: trimmedCity,
      })
      setMessage('Профиль сохранен.')
    } catch {
      // Ошибка показывается через состояние mutation ниже.
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const profileError = localError || (updateProfile.error ? getProfileErrorMessage(updateProfile.error) : '')

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
              <span>ФИО</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>

            <label className={s.field}>
              <span>Телефон</span>
              <input
                value={phone}
                onChange={(event) => setPhone(normalizePhoneInput(event.target.value))}
                placeholder="+79991234567"
                inputMode="tel"
                required
              />
            </label>

            <label className={s.field}>
              <span>Район / городской округ</span>
              <select value={district} onChange={(event) => setDistrict(event.target.value)} required>
                <option value="">Выберите район</option>
                {sakhaDistricts.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className={s.field}>
              <span>Город или населенный пункт</span>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Например, Якутск"
                required
              />
            </label>

            {profileError ? (
              <div className={s.error}>{profileError}</div>
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
