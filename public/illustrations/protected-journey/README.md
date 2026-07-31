# Jornada Protegida - Assets

Esta pasta prepara os assets visuais da experiencia narrativa interativa "Jornada Protegida" da Home do Caminho Seguro.

A preparacao desta fase e somente de arquivos estaticos. Nao ha implementacao de Home, GSAP, Motion, navegacao, autenticacao, banco de dados, APIs ou dashboards.

## Estrutura

- `source/`: arquivos SVG originais recebidos para avaliacao e preparo. Esta pasta e imutavel para o projeto.
- `optimized/`: copias preparadas para uso futuro na experiencia da Home.

Regra obrigatoria: nunca alterar, sobrescrever, otimizar diretamente, renomear ou excluir arquivos dentro de `source/`.

## Origem e licenca

A origem/licenca formal dos arquivos ainda precisa ser confirmada antes de uso comercial definitivo.

Evidencias encontradas nos proprios SVGs:

- `house-old.svg` contem `artist="Katerina Limpitsouni"` e `source="https://undraw.co/"` no elemento raiz. A licenca/atribuicao ainda deve ser confirmada na fonte oficial antes do uso final.
- Varios arquivos possuem IDs internos com prefixo `freepik--...`, indicando provavel origem Freepik/Storyset ou exportacao relacionada. Nao ha termos de licenca embutidos nos arquivos analisados. Necessita confirmacao.
- Arquivos sem metadados de origem embutidos tambem ficam marcados como necessita confirmacao.

## Assets selecionados

| Nome original | Nome otimizado | Papel na jornada | Status | Observacoes |
| --- | --- | --- | --- | --- |
| `child-walking.svg` | `optimized/child-walking.svg` | Crianca em deslocamento | Usado | Pode ser movido como bloco. Se houver animacao de pernas/bracos, converter futuramente para componente React SVG. |
| `house-old.svg` | `optimized/home.svg` | Casa/inicio do trajeto | Usado com ressalva | Unico asset de casa disponivel. Apesar do sufixo `old`, foi usado por necessidade funcional e deve ser substituido se surgir um `home.svg` mais consistente. |
| `neighborhood.svg` | `optimized/neighborhood.svg` | Bairro/mapa contextual | Usado com cautela | Muito pesado e detalhado. Usar como bloco, referencia ou background controlado. Pode exigir versao simplificada depois. |
| `community-store.svg` | `optimized/community-store.svg` | Ponto seguro da comunidade | Usado com cautela | Muito detalhado. Recomendado como bloco unico ou recorte visual, nao animacao interna ampla. |
| `bus-stop.svg` | `optimized/bus-stop.svg` | Parada/checkpoint de transporte | Usado | Bom candidato para checkpoint visual do embarque. |
| `school-bus.svg` | `optimized/school-bus.svg` | Transporte escolar | Usado | Pode ser movido como bloco. Rodas/porta exigiriam componente React SVG futuro. |
| `school.svg` | `optimized/school.svg` | Chegada na escola | Usado | Destino final da jornada. Usar como bloco. |

## Assets mantidos apenas como referencia

| Asset | Motivo |
| --- | --- |
| `notifications-reference.svg` | A notificacao final deve ser preferencialmente HTML/CSS/React para responsividade, texto real e acessibilidade. |
| `location-reference.svg` | Pode inspirar iconografia de localizacao, mas estados podem ser feitos com componentes React/SVG originais. |
| `navigation-reference.svg` | Pode inspirar o mapa final, mas a interface final deve ser criada com camadas leves e controlaveis. |
| `children-reference.svg` | Referencia humana alternativa; nao necessaria na primeira narrativa. |
| `doctor-reference.svg` | Fora do fluxo principal casa -> checkpoints -> transporte -> escola. |

## Assets descartados ou em reserva

| Asset | Motivo |
| --- | --- |
| `bus-stop-old.svg` | Redundante; preferir `bus-stop.svg`. |
| `school-bus-old.svg` | Redundante; preferir `school-bus.svg`. |
| `school-old.svg` | Redundante e mais pesado; preferir `school.svg`. |

## Tratamento aplicado nas copias otimizadas

- Remocao de declaracao XML/DOCTYPE quando presente.
- Remocao de comentarios, `metadata`, `title` e `desc` quando presentes.
- Remocao de `width` e `height` fixos no elemento raiz quando `viewBox` esta presente.
- Preservacao obrigatoria de `viewBox`.
- Adicao de `id="journey-*"` e `data-journey-asset="*"` no SVG raiz para facilitar selecao futura por GSAP sem depender do nome do arquivo.
- Remocao de IDs internos nao referenciados para reduzir ruido e evitar dependencia em IDs exportados por ferramentas externas.
- Normalizacao conservadora de cores para aproximar os assets da identidade do Caminho Seguro:
  - verdes legados aproximados para `#16b370` ou `#0a905a`;
  - tons escuros azulados/cinza para `#0f172a`, `#334155` e `#475569`.
- Minificacao conservadora de espacos entre tags.

Nao foi feita simplificacao agressiva de paths porque esta fase prioriza preservar proporcoes, significado e compatibilidade visual.

## Preparacao para animacao futura

Na futura implementacao com GSAP:

- mover assets de cena como blocos usando `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation` e `autoAlpha`;
- evitar animar `top`, `left`, `width`, `height`, `margin` ou `padding`;
- usar `transformOrigin` ou `svgOrigin` somente quando houver necessidade real;
- manter `neighborhood.svg` e `community-store.svg` como blocos ou referencias por causa do peso;
- converter para componente React SVG apenas assets que precisarem de animacao interna.

Possiveis componentes React SVG futuros:

- `child-walking.svg`: se pernas/bracos precisarem de ciclo de caminhada.
- `school-bus.svg`: se rodas, porta ou luzes precisarem animar internamente.
- Checkpoint: deve ser componente original do Caminho Seguro, nao baixado externamente.

## Checkpoint planejado

O checkpoint sera criado depois como componente original React/SVG, com estados:

- `idle`;
- `detecting`;
- `validating`;
- `validated`;
- `attention`.

Elementos planejados:

- base;
- icone;
- anel;
- ondas;
- simbolo de confirmacao;
- label;
- horario opcional.

## Consistencia visual

Os assets ainda misturam origens e niveis de detalhe. A primeira versao da jornada deve controlar a composicao com layout, escala, opacidade, fundos leves e estados visuais do proprio Caminho Seguro.

Para uma entrega mais refinada, recomenda-se futuramente:

- substituir `home.svg` por um asset de casa nao marcado como antigo;
- criar uma versao simplificada de `neighborhood.svg`;
- avaliar recorte ou simplificacao de `community-store.svg`;
- confirmar licencas antes de uso comercial ou publico definitivo.