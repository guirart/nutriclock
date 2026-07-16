'use client';

import { useState } from 'react';
import { Mail, KeyRound } from 'lucide-react';

export default function AuthScreen({onSession,supabase}){
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');

  async function submit(event){
    event.preventDefault();
    setLoading(true);setMessage('');
    try{
      if(!supabase) throw new Error('Supabase não configurado neste deploy.');
      if(mode==='signup'){
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{name}}});
        if(error) throw error;
        if(data.session) onSession(data.session);
        else setMessage('Conta criada. Confira seu e-mail para confirmar o cadastro.');
      }else{
        const {data,error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error;
        if(!data.session) throw new Error('A sessão não foi criada. Verifique o e-mail e a senha.');
        onSession(data.session);
      }
    }catch(error){setMessage(error?.message||'Não foi possível autenticar.');}
    finally{setLoading(false);}
  }

  return <main className="authShell">
    <section className="authCard">
      <div className="authBrand"><div className="logoMark">N</div><div><h1>NutriClock</h1><p>Seu progresso, seus dados, sua jornada.</p></div></div>
      <div className="authTabs"><button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setMessage('');}}>Entrar</button><button type="button" className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMessage('');}}>Criar conta</button></div>
      <form onSubmit={submit} className="authForm">
        {mode==='signup'&&<label>Nome<input value={name} onChange={e=>setName(e.target.value)} required/></label>}
        <label><Mail size={16}/> E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
        <label><KeyRound size={16}/> Senha<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={mode==='login'?'current-password':'new-password'}/></label>
        <button className="primary" disabled={loading}>{loading?'Aguarde...':mode==='login'?'Entrar no NutriClock':'Criar minha conta'}</button>
      </form>
      {message&&<p className="authMessage" role="alert">{message}</p>}
      <small>Cada conta possui registros nutricionais, perfil e progresso de RPG separados.</small>
    </section>
  </main>;
}
