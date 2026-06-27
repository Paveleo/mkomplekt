import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import s from './AuthPage.module.css'

type Mode = 'login' | 'register'

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

const benefits = [
  'Сохраняйте корзину и возвращайтесь к ней с любого устройства.',
  'Быстрее оформляйте заявки без повторного ввода контактов.',
  'Контактные данные хранятся в профиле и используются только для работы с заказом.',
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

export default function AuthPage() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const requestedMode = params.get('mode') === 'register' ? 'register' : 'login'
  const redirect = params.get('redirect') || '/account'
  const [mode, setMode] = useState<Mode>(requestedMode)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMode(requestedMode)
  }, [requestedMode])

  useEffect(() => {
    if (!loading && user) {
      navigate(redirect, { replace: true })
    }
  }, [loading, navigate, redirect, user])

  const title = useMemo(
    () => (mode === 'login' ? 'Вход в личный кабинет' : 'Создание аккаунта'),
    [mode],
  )

  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Войдите в аккаунт, чтобы сохранить подборку товаров, получить доступ к корзине и быстрее оформить заказ.'
        : 'Регистрация доступна для покупателей из Республики Саха (Якутия). Телефон нужен для связи по заказу.',
    [mode],
  )

  const submitLabel = useMemo(() => {
    if (submitting) {
      return mode === 'login' ? 'Входим...' : 'Создаем аккаунт...'
    }
    return mode === 'login' ? 'Войти' : 'Создать аккаунт'
  }, [mode, submitting])

  const changeMode = (nextMode: Mode) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('mode', nextMode)
    setParams(nextParams, { replace: true })
    setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const trimmedEmail = email.trim()

      if (mode === 'login') {
        if (!trimmedEmail || !password) {
          setError('Введите email и пароль.')
          return
        }

        await login({
          email: trimmedEmail,
          password,
        })
        navigate(redirect, { replace: true })
        return
      }

      const trimmedFullName = fullName.trim()
      const normalizedPhone = normalizePhoneInput(phone)

      if (!trimmedFullName) {
        setError('Введите ФИО.')
        return
      }
      if (!isValidRussianMobilePhone(normalizedPhone)) {
        setError('Введите действующий российский мобильный номер в формате +7XXXXXXXXXX.')
        return
      }
      if (!district) {
        setError('Выберите район или городской округ Республики Саха (Якутия).')
        return
      }
      if (!trimmedEmail) {
        setError('Введите email.')
        return
      }
      if (password.length < 6) {
        setError('Пароль должен быть не короче 6 символов.')
        return
      }

      await register({
        email: trimmedEmail,
        password,
        full_name: trimmedFullName,
        phone: normalizedPhone,
        district,
      })
      navigate(redirect, { replace: true })
    } catch (submitError: any) {
      if (submitError?.detail === 'EMAIL_ALREADY_EXISTS') {
        setError('Пользователь с таким email уже существует.')
      } else if (submitError?.detail === 'PHONE_ALREADY_EXISTS') {
        setError('Этот телефон уже привязан к другому аккаунту.')
      } else if (submitError?.detail === 'INVALID_PHONE') {
        setError('Введите действующий российский мобильный номер в формате +7XXXXXXXXXX.')
      } else if (submitError?.detail === 'INVALID_DISTRICT') {
        setError('Выберите район или городской округ Республики Саха (Якутия).')
      } else if (submitError?.detail === 'PASSWORD_TOO_SHORT') {
        setError('Пароль должен быть не короче 6 символов.')
      } else if (submitError?.detail === 'INVALID_CREDENTIALS') {
        setError('Неверный email или пароль.')
      } else {
        setError(submitError.message || 'Не удалось выполнить действие.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={s.wrap}>
      <div className={s.shell}>
        <aside className={s.story}>
          <div className={s.storyInner}>
            <p className={s.eyebrow}>МебельКомплект</p>
            <h1 className={s.storyTitle}>Личный кабинет для заказов и корзины</h1>
            <p className={s.storyText}>
              Контакты, район доставки и корзина сохраняются в одном профиле. Так менеджеру проще связаться с вами
              и быстрее уточнить заказ.
            </p>

            <div className={s.metricRow}>
              <div className={s.metricCard}>
                <span className={s.metricValue}>+7</span>
                <span className={s.metricLabel}>только российские мобильные номера</span>
              </div>
              <div className={s.metricCard}>
                <span className={s.metricValue}>14</span>
                <span className={s.metricLabel}>регион: Республика Саха (Якутия)</span>
              </div>
            </div>

            <div className={s.benefitList}>
              {benefits.map((item) => (
                <div className={s.benefit} key={item}>
                  <span className={s.benefitMark} aria-hidden="true">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className={s.card}>
          <div className={s.cardTop}>
            <div className={s.switcher}>
              <button
                type="button"
                className={`${s.switch} ${mode === 'login' ? s.switchActive : ''}`.trim()}
                onClick={() => changeMode('login')}
              >
                Вход
              </button>
              <button
                type="button"
                className={`${s.switch} ${mode === 'register' ? s.switchActive : ''}`.trim()}
                onClick={() => changeMode('register')}
              >
                Регистрация
              </button>
            </div>
          </div>

          <div className={s.cardBody}>
            <p className={s.cardEyebrow}>{mode === 'login' ? 'Авторизация' : 'Новый аккаунт'}</p>
            <h2 className={s.title}>{title}</h2>
            <p className={s.subtitle}>{subtitle}</p>

            <form className={s.form} onSubmit={handleSubmit}>
              {mode === 'register' ? (
                <>
                  <label className={s.field}>
                    <span>ФИО</span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Например, Иван Петров"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label className={s.field}>
                    <span>Телефон</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(normalizePhoneInput(event.target.value))}
                      placeholder="+79991234567"
                      autoComplete="tel"
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

                </>
              ) : null}

              <label className={s.field}>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className={s.field}>
                <span>Пароль</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Минимум 6 символов"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </label>

              {error ? <div className={s.error}>{error}</div> : null}

              <button type="submit" className={s.submit} disabled={submitting || loading}>
                {submitLabel}
              </button>
            </form>

            <div className={s.footer}>
              <span className={s.footerText}>Можно посмотреть ассортимент без авторизации.</span>
              <Link className={s.footerLink} to="/catalog">
                Перейти в каталог
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
