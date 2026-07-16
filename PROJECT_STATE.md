# NutriClock — Estado do Projeto

## Versão
v9.1 — Conselho de Gamificação Integrado

## Implementado nesta versão
- Hierarquia visual simplificada para a tela do macaco.
- Próxima ação do jogador exibida antes da cena principal.
- Cena do companheiro ampliada para assumir o papel de foco visual.
- Ações, necessidades e informações reorganizadas.
- Evento diário determinístico de exploração.
- Recompensas persistentes de exploração.
- Feed de golpes recentes no chefe semanal.
- Responsividade revisada para telas pequenas.

## Persistência local
- `nutriclock_expedition_v1`: evento e coleta diária.
- As chaves já existentes de personagem, inventário, equipamentos, baús e login foram preservadas.

## Validação
- `npm run build` concluído com sucesso em Next.js 15.5.9.

## Próximas melhorias recomendadas
- Trocar emojis remanescentes por sprites pixel art próprios.
- Criar sistema de expedição com duração real e múltiplas regiões.
- Persistir o estado do RPG no Supabase para uso entre dispositivos.
- Adicionar feedback sonoro opcional e configurações de acessibilidade.
