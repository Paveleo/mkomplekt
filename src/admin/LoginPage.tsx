import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const nav = useNavigate()
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({email,password})
    if(error) alert(error.message); else nav('/admin')
  }
  return (
    <form onSubmit={submit} style={{maxWidth:360,margin:'64px auto',display:'grid',gap:12}}>
      <h1>Вход</h1>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button>Войти</button>
    </form>
  )
}
