# NutriClock v7.0.1 — correção de deploy na Vercel

O build anterior compilava normalmente, mas a Vercel bloqueava a publicação porque o Next.js 15.5.2 foi identificado como vulnerável.

Correções:
- Next.js atualizado para 15.5.9;
- React e React DOM alinhados em 19.2.7;
- Node.js fixado na linha 20.x;
- nenhuma funcionalidade do NutriClock foi removida.

## Publicação

1. Extraia o ZIP.
2. Envie todo o conteúdo para a raiz do repositório.
3. Substitua os arquivos existentes.
4. Faça commit.
5. Aguarde o novo deploy da Vercel.

A mensagem `Vulnerable version of Next.js detected` não deve mais bloquear o deploy.
