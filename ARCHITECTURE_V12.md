# NutriClock v12 — arquitetura modular

## Estrutura

- `components/providers/AuthProvider.js`: única fonte de verdade para sessão e autenticação.
- `components/auth/`: telas de login e configuração isoladas.
- `components/app/AppEntry.js`: gateway da aplicação, sem lógica de produto.
- `components/app/NutriClockApp.js`: experiência existente preservada durante a migração gradual.
- `app/home`, `app/nutrition`, `app/rpg`, `app/profile`, `app/settings`: rotas de módulo independentes.
- `lib/storage/userScopedStorage.js`: contrato único para armazenamento local isolado por UUID.
- `app/api`: APIs continuam validando o usuário pelo servidor.

## Estratégia de migração

A v12 não descarta funcionalidades. Ela cria limites arquiteturais para que cada módulo possa ser extraído do componente legado sem regressões. As próximas extrações recomendadas são NutritionEngine, PetEngine, BattleEngine, InventoryEngine e RewardEngine.

## Variáveis obrigatórias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NUTRICLOCK_API_KEY`
