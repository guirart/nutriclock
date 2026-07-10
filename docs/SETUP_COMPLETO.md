# NutriClock Cloud — instalação completa

## O que este projeto faz

O sistema usa um único banco de dados:

**GPT personalizado → API Vercel → Supabase ← aplicativo no iPhone**

Ao enviar uma foto ou descrição ao GPT personalizado, ele chama a Action, salva no Supabase e o aplicativo atualiza automaticamente em até 15 segundos.

> Uma conversa comum do ChatGPT não chama automaticamente APIs particulares. A automação exige abrir o GPT personalizado configurado com a Action do NutriClock.

## 1. Revogue o token do GitHub exposto

O token compartilhado anteriormente deve permanecer revogado. Não coloque tokens, senhas ou Service Role Keys no GitHub.

## 2. Criar o projeto no Supabase

1. Crie uma conta/projeto no Supabase.
2. Abra **SQL Editor**.
3. Copie e execute `supabase/schema.sql`.
4. Em **Project Settings → API**, copie:
   - Project URL
   - `service_role` key

A `service_role` é secreta e só deve ser colocada nas variáveis da Vercel.

## 3. Publicar no GitHub

Crie ou use o repositório `guirart/nutriclock`.

Suba o conteúdo deste ZIP para a raiz do repositório.

## 4. Publicar na Vercel

1. Entre na Vercel com o GitHub.
2. Clique em **Add New → Project**.
3. Importe `guirart/nutriclock`.
4. Framework detectado: Next.js.
5. Configure as variáveis:

```text
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_secreta
NUTRICLOCK_API_KEY=uma_chave_longa_aleatoria
NUTRICLOCK_USER_ID=rafael
NEXT_PUBLIC_NUTRICLOCK_USER_ID=rafael
```

6. Faça o deploy.

Teste:

```text
https://SEU-PROJETO.vercel.app/api/health
```

## 5. Abrir o aplicativo

Abra o endereço da Vercel no Safari do iPhone.

No campo “Chave privada do NutriClock”, cole a mesma `NUTRICLOCK_API_KEY`.

Depois use **Compartilhar → Adicionar à Tela de Início**.

## 6. Criar o GPT personalizado

1. No ChatGPT, crie um GPT.
2. Use as instruções de `docs/GPT_INSTRUCTIONS.txt`.
3. Em **Actions**, importe a URL:

```text
https://SEU-PROJETO.vercel.app/api/openapi
```

4. Autenticação:
   - Tipo: API Key
   - Header: `X-API-Key`
   - Valor: a mesma `NUTRICLOCK_API_KEY`

5. Teste a Action:
   - “Registre 100 g de arroz, 100 g de frango e uma banana.”

## 7. Uso diário

Abra o GPT “NutriClock Assistente”, mande foto ou texto e aguarde a confirmação de que o registro foi salvo.

O aplicativo consulta a mesma base e atualiza automaticamente.

## Segurança

- Nunca envie `SUPABASE_SERVICE_ROLE_KEY` ao ChatGPT.
- Nunca coloque `.env.local` no GitHub.
- A chave da Action pode ser trocada na Vercel a qualquer momento.
- Para maior segurança futura, substitua a API key por OAuth individual.
