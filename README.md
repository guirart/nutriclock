# NutriClock Cloud

Sistema sincronizado de acompanhamento nutricional.

## Componentes

- Next.js PWA para iPhone
- API protegida por chave
- Supabase/Postgres
- OpenAPI para GPT Actions
- Atualização automática a cada 15 segundos

Leia `docs/SETUP_COMPLETO.md`.

## Desenvolvimento local

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Endpoints

- `GET /api/health`
- `GET/POST/DELETE /api/entries`
- `GET /api/summary`
- `GET /api/openapi`
