
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import s from './AppShell.module.css';

export default function App() {
  const { pathname } = useLocation();

  const onHero = pathname === '/'; 
  const ctaBlack =
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/products');

  return (
    <div className={s.shell}>
      <Header onHero={onHero} ctaBlack={ctaBlack} />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
