## v9.9 — Correção de inventário e layout

- Corrige caminhos de assets exibidos como texto.
- Normaliza caminhos antigos salvos no localStorage.
- Impede colapso das colunas de missões, equipamentos e inventário.
- Adiciona fallback visual para assets ausentes.

# NutriClock v9 — Conselho integrado

Decisões aplicadas por quatro perspectivas:

## Nutrologia
- peso mais recente vem automaticamente dos registros `type: weight`;
- avaliação diária usa metas individuais;
- composição corporal permanece como última leitura de bioimpedância;
- metas continuam adaptadas ao objetivo do perfil.

## Fitness
- energia e felicidade passam a afetar desempenho;
- treino do companheiro adiciona dano;
- equipamentos de força, determinação, disciplina e energia aumentam o multiplicador;
- descanso e cuidado deixam de ser apenas cosméticos.

## Game design
- baús agora podem entregar equipamentos, brinquedos, itens de descanso e bananas;
- itens de cuidado são consumíveis;
- humor e energia alteram o dano no chefe;
- tela do chefe mostra dano base e multiplicadores;
- recompensas formam um ciclo: hábitos → baús → cuidado/equipamento → dano.

## Engenharia
- peso é lido do registro mais recente do banco;
- barra selecionada do gráfico usa azul mais escuro, sem retângulo branco;
- estados e inventário permanecem persistidos;
- interface mantém foco em poucas ações principais.

Observação: para uma foto de balança atualizar automaticamente o peso, o GPT/API deve criar um registro `weight` com `weight_kg`. O app então usa esse registro mais recente sem alteração manual.

## NutriClock v9.1 — Conselho de Gamificação

Melhorias integradas nesta versão:

- nova hierarquia visual da tela do companheiro;
- foco diário destacado com a próxima missão incompleta;
- cenário do personagem ampliado e interface mais limpa;
- painel de ações reorganizado para reduzir confusão;
- evento diário de exploração persistente;
- recompensas de exploração com bananas, energia, felicidade ou baú;
- feed dos últimos golpes contra o chefe semanal;
- melhor adaptação mobile da área de gamificação;
- identidade pixelizada preservada sem aparência de dashboard administrativo.

O estado de exploração é salvo em `localStorage` pela chave `nutriclock_expedition_v1`.

### Correção v10.6
O Monkey King agora é animado em quadros completos de 64x32 px. Isso impede o efeito de piscar/deslocar de um lado para o outro causado pelo recorte anterior em células de 32 px.


### v10.7
A interface RPG usa molduras de bambu programadas em CSS e o Monkey King foi ampliado em 200%.
