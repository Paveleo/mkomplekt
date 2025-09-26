import { Outlet, Navigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminLayout(){
  const [loading,setLoading]=useState(true)
  const [authed,setAuthed]=useState(false)

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ setAuthed(!!data.session); setLoading(false) })
  },[])

  if(loading) return null
  if(!authed) return <Navigate to="/admin/login" replace/>
  return (
    <div style={{display:'grid',gridTemplateColumns:'240px 1fr',minHeight:'100vh'}}>
      <aside style={{borderRight:'1px solid #eee',padding:16}}>
        <b>Админка</b>
        <nav style={{display:'grid',gap:8,marginTop:16}}>
          <Link to="/admin">Дашборд</Link>
          <Link to="/admin/categories">Категории</Link>
          <Link to="/admin/products">Товары</Link>
          <Link to="/admin/import">Импорт</Link>
        </nav>
        <button style={{marginTop:16}} onClick={async()=>{ await supabase.auth.signOut(); location.href='/admin/login' }}>Выйти</button>
      </aside>
      <main style={{padding:24}}><Outlet/></main>
    </div>
  )
}
