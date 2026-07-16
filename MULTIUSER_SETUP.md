# NutriClock v11 — Configuração multiusuário

## 1. Ativar autenticação

No Supabase, abra **Authentication > Providers > Email** e habilite login por e-mail e senha.

Para testes imediatos, desative temporariamente a confirmação de e-mail. Em produção, mantenha a confirmação ligada e configure o domínio da Vercel em **Authentication > URL Configuration**.

## 2. Executar a migração

Execute `SUPABASE_MULTIUSER.sql` no SQL Editor do Supabase.

Os registros passam a ser isolados pelo UUID da conta autenticada. Nenhum usuário consegue consultar, editar ou excluir registros de outro usuário.

## 3. Migrar os dados antigos do Rafael

Crie a conta do Rafael pelo aplicativo, copie o UUID em **Authentication > Users** e execute:

```sql
update public.nutrition_entries
set user_id = 'UUID_DA_CONTA_DO_RAFAEL'
where user_id = 'rafael';
```

## 4. Variáveis da Vercel

Configure:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NUTRICLOCK_API_KEY`

Use `.env.example` como referência. Nunca exponha a service role no navegador.

## 5. Integração externa do ChatGPT

As chamadas autenticadas pelo app usam o token da sessão automaticamente.

Para a integração externa, envie:

```http
X-API-Key: SUA_CHAVE
X-User-Id: UUID_DA_CONTA
```

O `X-User-Id` define em qual conta o registro será criado. Não use mais `rafael` em novas integrações.

## Escopo implementado

- cadastro por e-mail e senha;
- login persistente;
- logout;
- registros nutricionais isolados no Supabase;
- perfil, inventário, equipamentos, gems, pet e progresso de RPG isolados por conta no navegador;
- compatibilidade com a API externa mediante UUID do usuário.

O progresso do RPG está isolado por conta no navegador. Uma futura etapa pode sincronizá-lo no Supabase para funcionar entre dispositivos diferentes.
