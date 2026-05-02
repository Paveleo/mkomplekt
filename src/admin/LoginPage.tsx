import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import styles from './admin.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { loginAdmin } = useAuth()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await loginAdmin({ email, password })
      nav('/admin')
    } catch (requestError: any) {
      if (requestError?.detail === 'ADMIN_REQUIRED') {
        setError('У пользователя нет прав администратора.')
        return
      }
      setError(requestError?.message ?? 'Ошибка входа')
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <p className={styles.eyebrow}>Admin access</p>
        <h1 className={styles.title}>Вход в админку</h1>
        <p className={styles.subtitle}>
          Управляйте товарами, категориями и заказами из одной панели.
        </p>

        <form onSubmit={submit} className={styles.loginForm}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              className={styles.input}
              placeholder="manager@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Пароль</span>
            <input
              className={styles.input}
              placeholder="Введите пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? <div className={styles.errorNotice}>{error}</div> : null}

          <button className={styles.buttonPrimary}>Войти</button>
        </form>
      </div>
    </div>
  )
}
