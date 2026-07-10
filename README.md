# NutriClock v6.2.1 — público sem autorização

Esta versão removeu completamente a verificação de API Key dos endpoints:
- GET/POST/PATCH/DELETE /api/entries
- GET /api/summary

Também removeu o cabeçalho de autenticação do frontend.

Como publicar corretamente:
1. Extraia o ZIP.
2. Entre na pasta extraída.
3. Envie o CONTEÚDO da pasta para a raiz do repositório.
4. Não envie a pasta externa como uma pasta dentro do GitHub.
5. Confirme que estes arquivos foram substituídos:
   - app/api/entries/route.js
   - app/api/summary/route.js
   - app/page.js
   - package.json
6. Faça commit.
7. Na Vercel, abra Deployments e clique em Redeploy no commit novo.

Teste após o deploy:
- https://nutriclock.vercel.app/api/entries?limit=5
- https://nutriclock.vercel.app/api/summary

Nenhum dos dois endpoints deve responder “Não autorizado”.

Aviso: todos os usuários compartilham os mesmos dados nesta edição.
