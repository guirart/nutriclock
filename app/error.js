'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => { console.error('NutriClock client error:', error); }, [error]);
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="authBrand"><div className="logoMark">N</div><div><h1>NutriClock</h1><p>O aplicativo encontrou um erro.</p></div></div>
        <p className="authMessage">{error?.message || 'Não foi possível carregar esta tela.'}</p>
        <button className="primary" onClick={reset}>Tentar novamente</button>
      </section>
    </main>
  );
}
