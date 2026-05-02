import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import s from './AuthPage.module.css';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedMode = params.get('mode') === 'register' ? 'register' : 'login';
  const redirect = params.get('redirect') || '/account';
  const [mode, setMode] = useState<Mode>(requestedMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(requestedMode);
  }, [requestedMode]);

  useEffect(() => {
    if (!loading && user) {
      navigate(redirect, { replace: true });
    }
  }, [loading, navigate, redirect, user]);

  const title = useMemo(
    () => (mode === 'login' ? 'Вход в личный кабинет' : 'Регистрация'),
    [mode],
  );

  const changeMode = (nextMode: Mode) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('mode', nextMode);
    setParams(nextParams, { replace: true });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        await login({
          email: email.trim(),
          password,
        });
        navigate(redirect, { replace: true });
        return;
      }

      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });
      navigate(redirect, { replace: true });
    } catch (submitError: any) {
      if (submitError?.detail === 'EMAIL_ALREADY_EXISTS') {
        setError('Пользователь с таким email уже существует.');
      } else if (submitError?.detail === 'INVALID_CREDENTIALS') {
        setError('Неверный email или пароль.');
      } else {
        setError(submitError.message || 'Не удалось выполнить действие.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={s.wrap}>
      <div className={s.card}>
        <div className={s.switcher}>
          <button
            type="button"
            className={`${s.switch} ${mode === 'login' ? s.switchActive : ''}`}
            onClick={() => changeMode('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={`${s.switch} ${mode === 'register' ? s.switchActive : ''}`}
            onClick={() => changeMode('register')}
          >
            Регистрация
          </button>
        </div>

        <h1 className={s.title}>{title}</h1>
        <p className={s.subtitle}>
          Авторизованный пользователь может сохранять корзину и вернуться к товарам с любого устройства.
        </p>

        <form className={s.form} onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className={s.field}>
              <span>Имя</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Как к вам обращаться"
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
          {message ? <div className={s.message}>{message}</div> : null}

          <button type="submit" className={s.submit} disabled={submitting}>
            {submitting ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className={s.footer}>
          <span>После входа корзина будет привязана к вашему аккаунту.</span>
          <Link to="/catalog">Перейти в каталог</Link>
        </div>
      </div>
    </section>
  );
}
