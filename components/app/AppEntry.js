'use client';

import { useSearchParams } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import AuthScreen from '../auth/AuthScreen';
import ConfigurationScreen from '../auth/ConfigurationScreen';
import NutriClockApp from './NutriClockApp';

const MODULES=new Set(['home','recipes','history','stats','pet','profile']);

export default function AppEntry({forcedModule}){
  const params=useSearchParams();
  const requested=forcedModule||params.get('module')||'home';
  const initialModule=MODULES.has(requested)?requested:'home';
  const {session,setSession,loading,startupError,config,supabase,signOut}=useAuth();

  if(!config||!supabase) return <ConfigurationScreen/>;
  if(loading) return <main className="authShell"><div className="authLoading">Carregando NutriClock...</div></main>;
  if(!session) return <><AuthScreen onSession={setSession} supabase={supabase}/>{startupError&&<div className="startupToast" role="alert">{startupError}</div>}</>;
  return <NutriClockApp key={`${session.user.id}-${initialModule}`} session={session} onSignOut={signOut} initialModule={initialModule}/>;
}
