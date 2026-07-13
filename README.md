# NutriClock v8.2.1 — correção de deploy

Correções aplicadas:
- Node.js atualizado para 24.x;
- instalação da Vercel alterada para `npm ci` com instalação limpa;
- `caniuse-lite` e `browserslist` adicionados explicitamente;
- package-lock regenerado;
- cache antigo de `node_modules` deixa de interferir no build.

Publique todo o conteúdo na raiz do GitHub. Na Vercel, faça um novo deploy sem reutilizar o cache de build, se essa opção for exibida.
