## v9.9 — Correção de inventário e layout

- Corrige caminhos de assets exibidos como texto.
- Normaliza caminhos antigos salvos no localStorage.
- Impede colapso das colunas de missões, equipamentos e inventário.
- Adiciona fallback visual para assets ausentes.

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


## v9.2 — Jornadas e chefes diários
- Tela do companheiro reorganizada para remover o grande espaço vazio.
- Jornada diária integrada diretamente à cena principal.
- Sete chefes rotativos: Cogumelo Rei, Rei Slime, Golem de Cristal, Escorpião do Sol, Coruja da Tempestade, Javali de Lava e Fantasma Lunar.
- Sete ambientações próprias em pixel art vetorial.
- Vida e dano do chefe diário calculados por missões, interações, alimentação, treino e equipamentos.
- Recompensa diária persistente: bananas, felicidade e baú conforme a dificuldade.
- Chefe semanal preservado como objetivo de longo prazo.
- Build de produção validado com sucesso em Next.js 15.5.9.


## v9.4 — Mundo animado
- Macaco estático substituído por sprite público animado com fallback local.
- Cenário principal transformado em pequeno mundo interativo.
- Árvore, fogueira e baú agora são objetos clicáveis.
- Ambiente acompanha a jornada/chefe diário.
- Créditos e licença documentados em `ASSET_CREDITS.md`.

## v9.7 — UI Essentials and weekly boss rotation
- RPG panels, buttons, bars and slots now use the supplied Complete UI Essential Pack.
- All generated RPG loot now uses images exclusively from the supplied 2D Assets Pack.
- Legacy emoji inventory icons are migrated to asset images when loaded.
- Weekly boss rotates automatically according to the calendar week.
- Weekly bosses use the existing animated enemy sprites and humorous names.

## v10.0 — Correção definitiva de contraste do RPG
- Removido o preenchimento central claro das molduras do UI Essentials.
- UI Essentials agora é usado como borda, preservando a paleta escura do NutriClock.
- Painéis, botões, slots, barras, missões, inventário e chefe semanal receberam fundos escuros explícitos.
- Títulos e textos receberam contraste consistente e tokens de cor centralizados no escopo `.pixelPetPage`.
- Build de produção validado com Next.js 15.5.9.

## v10.1 — animações do Monkey King por linha
- Estado neutro: animação da linha 1 do spritesheet.
- Treinar: seleciona aleatoriamente uma animação entre as linhas 4, 5, 6 e 7.
- Interagir: usa exclusivamente a animação da linha 8.
- Ataques automáticos ao chefe usam a sequência da linha 6.
