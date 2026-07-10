# NutriClock v6.2 — versão estável para GitHub

Correções:
- usuário fixo `rafael` em GET, POST, PATCH, DELETE e summary;
- registros antigos voltam a aparecer no calendário, histórico e cards;
- exercícios sempre são tratados como gasto positivo internamente;
- saldo líquido calculado corretamente;
- datas filtradas no fuso de Brasília;
- modo público sem exigir chave no navegador;
- mantém receitas, histórico, estatísticas, perfil e pet virtual.

## Publicação

1. Extraia este ZIP.
2. Envie TODO o conteúdo para a raiz do repositório GitHub.
3. Substitua os arquivos existentes.
4. Faça o commit.
5. Aguarde o deploy automático da Vercel.

Não é necessário alterar nenhum arquivo manualmente.

Variáveis que devem continuar na Vercel:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

A variável NUTRICLOCK_USER_ID deixa de ser usada nesta versão.
