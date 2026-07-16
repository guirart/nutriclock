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

## v10.6 — estabilização do Monkey King
- Corrigido o recorte do spritesheet: cada quadro visual ocupa 64x32 px, não 32x32 px.
- Idle usa 4 quadros completos da linha 1, mantendo o personagem ancorado no mesmo ponto.
- Interação e treinos também passaram a usar quadros completos de 64 px para evitar alternância entre metades do personagem.


## v10.7
- Monkey King ampliado para 200% do tamanho visual da v10.6 em desktop.
- Molduras brancas removidas do RPG.
- Molduras de bambu implementadas em CSS, sem criação de imagens novas.
- Paleta escura e contraste do NutriClock preservados.

## v10.8
- Corrigida corrida de inicialização que podia sobrescrever inventário e baús com arrays vazios antes da leitura do localStorage.
- Adicionada recuperação única de quatro equipamentos básicos para instalações afetadas pelo bug.
- Layout do companheiro reorganizado para eliminar espaço vazio: cena ocupa duas linhas, perfil e ações ficam empilhados à direita.
- Grade de equipamentos e mochila compactada para manter proporções próximas da referência visual.

## v11.0 — Multiusuário

- Supabase Auth com cadastro, login, sessão persistente e logout.
- APIs de registros e resumo validam JWT e usam o UUID da conta.
- Suporte à integração externa por `X-API-Key` + `X-User-Id`.
- Chaves de localStorage recebem namespace do UUID, impedindo mistura de perfil e RPG entre contas no mesmo aparelho.
- Migração SQL e guia de implantação adicionados.

## v11.1 — inicialização segura
- A ausência de variáveis públicas do Supabase não derruba mais o aplicativo.
- O app exibe uma tela de configuração clara com os nomes exatos das variáveis.
- Inicialização de sessão, listener de autenticação e logout possuem tratamento de erro.
- Foi adicionado um Error Boundary para exceções de cliente.


## v12.1 — NutriAssist
- Aba Assistente com captura/upload de foto.
- Análise nutricional estruturada pela OpenAI.
- Confirmação antes do registro.
- Registro multiusuário no Supabase.
- Chave da OpenAI protegida no servidor.
## v12.2 — Modelo OpenAI fixo em TypeScript

- A rota `app/api/ai/analyze-meal/route.ts` agora é TypeScript.
- O modelo foi fixado no backend como `gpt-4.1-mini`.
- A variável `OPENAI_VISION_MODEL` não é mais necessária.
- Permanece necessária apenas a variável secreta `OPENAI_API_KEY`.
- Build de produção validado no Next.js 15.5.9.


## v12.3 — Correção de leitura do histórico
- O frontend passou a usar `/api/entries` como fonte única dos registros.
- Entradas são normalizadas para o schema real do Supabase (`description`, `protein_g`, `carbs_g`, `fat_g`, `occurred_at`).
- O resumo diário é calculado localmente em `America/Sao_Paulo`, evitando divergência de fuso entre API e calendário.
- Os filtros de data das APIs agora usam intervalo com início inclusivo e próximo dia exclusivo.
- Build de produção validado no Next.js 15.5.9.

## v12.5 — Integração GPT sem sessão expirada

- O contrato OpenAPI agora declara explicitamente autenticação por `X-API-Key`.
- As operações externas exigem `X-User-Id`, evitando dependência de sessão Supabase do GPT.
- Erros de autenticação passam a responder como HTTP 401 em vez de erro interno genérico.
- Nenhuma alteração visual, de sprite ou de asset foi realizada nesta versão.
