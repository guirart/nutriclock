# NutriClock v6.1.1 — Teste público corrigido

Correções aplicadas:
- remove o erro “Não autorizado” no modo público;
- libera GET, POST, PATCH e DELETE sem chave nesta edição de teste;
- volta a carregar resumo, calendário, histórico e cards;
- tenta sincronizar novamente após 2,5 segundos;
- melhora o espaço inferior para a barra fixa não cobrir formulários;
- mantém o pet virtual, receitas, histórico, estatísticas e perfil.

## Publicação

1. Extraia o ZIP.
2. Envie TODO o conteúdo para a raiz do repositório GitHub.
3. Substitua os arquivos existentes.
4. Faça o commit.
5. Aguarde o deploy automático da Vercel.

## Variáveis da Vercel

Mantenha:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NUTRICLOCK_USER_ID

A variável NUTRICLOCK_API_KEY pode continuar cadastrada, mas esta edição pública não a exige.

## Aviso

Todos compartilham a mesma conta e os mesmos registros. Qualquer pessoa com o link pode criar, editar ou excluir dados. Use apenas para teste temporário.
