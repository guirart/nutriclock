'use client';

export default function ConfigurationScreen(){
  return <main className="authShell">
    <section className="authCard authConfigCard">
      <div className="authBrand"><div className="logoMark">N</div><div><h1>NutriClock</h1><p>Configuração necessária</p></div></div>
      <h2>Conecte o Supabase na Vercel</h2>
      <p>O aplicativo foi carregado corretamente, mas as variáveis públicas de autenticação não estão disponíveis neste deploy.</p>
      <div className="configSteps"><code>NEXT_PUBLIC_SUPABASE_URL</code><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></div>
      <p className="authMessage">Adicione as duas variáveis em Vercel → Project Settings → Environment Variables e faça um novo deploy.</p>
      <button className="primary" onClick={()=>window.location.reload()}>Tentar novamente</button>
      <small>A chave usada aqui é a chave pública <strong>anon</strong>. Nunca coloque a service role em uma variável NEXT_PUBLIC.</small>
    </section>
  </main>;
}
