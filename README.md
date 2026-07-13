# NutriClock v8.2.2 — deploy limpo

Correção do deploy:
- removido package-lock.json gerado com URLs internas incompatíveis com a Vercel;
- removido installCommand com npm ci;
- Vercel usará npm install normal;
- dependências auxiliares desnecessárias removidas;
- Node 24.x mantido.

Envie o conteúdo desta pasta diretamente para a raiz do GitHub.
