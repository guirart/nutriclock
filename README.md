# NutriClock v6.1 — Teste público sem multiusuário

Esta versão foi criada para você compartilhar o link com amigos e testar o aplicativo sem login.

IMPORTANTE:
- todos usam a mesma conta;
- todos veem os mesmos registros;
- qualquer pessoa pode editar ou excluir os registros;
- use apenas para teste temporário;
- não use dados pessoais sensíveis.

Configuração na Vercel:
1. Vá em Settings → Environment Variables.
2. Crie:
   NUTRICLOCK_PUBLIC_TEST_MODE
3. Valor:
   true
4. Marque Production e Preview.
5. Faça um novo Redeploy.

As outras variáveis continuam iguais:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NUTRICLOCK_API_KEY
- NUTRICLOCK_USER_ID

Depois do teste, remova NUTRICLOCK_PUBLIC_TEST_MODE ou altere para false.
