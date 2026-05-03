import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollManager from './ScrollManager'
import s from './AppShell.module.css'

export default function App() {
  return (
    <div className={s.shell}>
      <ScrollManager />
      <Header />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
