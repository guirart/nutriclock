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
