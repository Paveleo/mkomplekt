import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import s from './AuthPage.module.css'

type Mode = 'login' | 'register'

const benefits = [
  'Сохраняйте корзину и возвращайтесь к ней с любого устройства.',
  'Быстрее оформляйте заявки без повторного ввода контактов.',
  'Следите за заказами и общением с менеджером в одном кабинете.',
]

export default function AuthPage() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const requestedMode = params.get('mode') === 'register' ? 'register' : 'login'
  const redirect = params.get('redirect') || '/account'
  const [mode, setMode] = useState<Mode>(requestedMode)
  const [fullName, setFullName] = useState('')
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
        : 'Создайте аккаунт, чтобы сохранить корзину, контактные данные и продолжить работу с проектом без потери выбранных товаров.',
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
      if (mode === 'login') {
        await login({
          email: email.trim(),
          password,
        })
        navigate(redirect, { replace: true })
        return
      }

      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      })
      navigate(redirect, { replace: true })
    } catch (submitError: any) {
      if (submitError?.detail === 'EMAIL_ALREADY_EXISTS') {
        setError('Пользователь с таким email уже существует.')
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
            <h1 className={s.storyTitle}>Личный кабинет в том же ритме, что и весь сайт</h1>
            <p className={s.storyText}>
              Без лишних шагов: вход, регистрация, сохраненная корзина и быстрый переход к вашим товарам и заявкам.
            </p>

            <div className={s.metricRow}>
              <div className={s.metricCard}>
                <span className={s.metricValue}>24/7</span>
                <span className={s.metricLabel}>доступ к корзине и профилю</span>
              </div>
              <div className={s.metricCard}>
                <span className={s.metricValue}>1</span>
                <span className={s.metricLabel}>аккаунт для всех обращений</span>
              </div>
            </div>

            <div className={s.benefitList}>
              {benefits.map((item) => (
                <div className={s.benefit} key={item}>
                  <span className={s.benefitMark} aria-hidden="true">
                    ●
                  </span>
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
                <label className={s.field}>
                  <span>Как к вам обращаться</span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Например, Павел"
                    autoComplete="name"
                  />
                </label>
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
              <span className={s.footerText}>Нужен быстрый просмотр ассортимента без авторизации?</span>
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
