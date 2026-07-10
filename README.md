# NutriClock v4 Profissional

Versão completa com:

- dashboard redesenhado;
- calendário mensal;
- gráficos de calorias e peso;
- edição e exclusão de registros;
- chave privada escondida nas configurações;
- integração preservada com Supabase, Vercel e GPT Actions;
- layout responsivo para iPhone e desktop.

## Publicação

1. Extraia o ZIP.
2. Apague o conteúdo antigo do repositório ou substitua tudo.
3. Envie todos os arquivos deste pacote para a raiz do GitHub.
4. Mantenha as mesmas variáveis de ambiente da Vercel:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - NUTRICLOCK_API_KEY
   - NUTRICLOCK_USER_ID
5. Aguarde o deploy automático.
6. Abra o aplicativo, clique em ⚙️ e cole a NUTRICLOCK_API_KEY uma única vez.
7. No GPT personalizado, reimporte:
   https://nutriclock.vercel.app/api/openapi
