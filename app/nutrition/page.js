import { Suspense } from 'react';
import AppEntry from '../../components/app/AppEntry';
export default function ModulePage(){return <Suspense fallback={<main className="authShell"><div className="authLoading">Carregando NutriClock...</div></main>}><AppEntry forcedModule="home"/></Suspense>;}
