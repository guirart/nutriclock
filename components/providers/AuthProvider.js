'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser, getSupabaseBrowserConfig } from '../../lib/supabaseBrowser';

const AuthContext=createContext(null);

export function AuthProvider({children}){
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  const [startupError,setStartupError]=useState('');
  const config=getSupabaseBrowserConfig();
  const supabase=useMemo(()=>getSupabaseBrowser(),[]);

  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    let mounted=true;
    let subscription;
    async function initialize(){
      try{
        const {data,error}=await supabase.auth.getSession();
        if(error) throw error;
        if(mounted) setSession(data?.session||null);
        const result=supabase.auth.onAuthStateChange((_event,nextSession)=>{if(mounted) setSession(nextSession||null);});
        subscription=result?.data?.subscription;
      }catch(error){
        console.error('Falha ao iniciar autenticação:',error);
        if(mounted){setSession(null);setStartupError(error?.message||'Não foi possível iniciar a autenticação.');}
      }finally{if(mounted) setLoading(false);}
    }
    initialize();
    return()=>{mounted=false;subscription?.unsubscribe?.();};
  },[supabase]);

  async function signOut(){
    try{await supabase?.auth.signOut();}
    catch(error){console.error('Falha ao sair:',error);}
    finally{setSession(null);}
  }

  return <AuthContext.Provider value={{session,setSession,loading,startupError,config,supabase,signOut}}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const value=useContext(AuthContext);
  if(!value) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return value;
}
