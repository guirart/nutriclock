# Configuração do NutriAssist

Na Vercel, adicione em **Settings → Environment Variables**:

```env
OPENAI_API_KEY=sua_chave_da_openai
```

A variável `OPENAI_API_KEY` deve ficar disponível para Production, Preview e Development conforme seu fluxo. Não crie uma variável `NEXT_PUBLIC_OPENAI_API_KEY`.

Depois, faça um novo deploy. A aba **Assistente** permitirá fotografar/enviar uma refeição, revisar a estimativa e confirmar o registro.
