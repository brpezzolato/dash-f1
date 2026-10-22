# Dash F1 🏁

Dashboard de **ciência de dados da Fórmula 1** em visual escuro de vidro fosco. Cada equipe tem a sua cor, usada em todos os gráficos.

- **Tela inicial (`/`)**, no layout de "app de corrida":
  - Vídeo da corrida no hero, com o nome do GP e o status ao vivo/final
  - Leaderboard com gap, pneu final e voltas nele, melhor volta e bandeira, com busca por piloto ou equipe
  - Painel **Overview**: o traçado se desenha na entrada e os carros circulam pela pista com os gaps reais da corrida; extensão, umidade e card do vencedor na cor da equipe, com efeito de inclinação
- **Dashboard (`/dashboard`)**
  - Última corrida, com leaderboard (gap, pneus usados, melhor volta, posições ganhas)
  - Visão do circuito: mapa com curvas numeradas, extensão, voltas, temperatura do ar e da pista, umidade, vento e chuva
  - Card do vencedor na cor da equipe
  - **Estratégia de pneus:** stints por piloto
  - **Ritmo de corrida:** box plot das voltas limpas
  - Evolução do campeonato, classificação de pilotos e construtores, legenda de cores das equipes e calendário

Seletor de temporada de 2000 até hoje, via `?season=AAAA`. Pneus, voltas e clima existem a partir de 2023.

## Fontes de dados

| Fonte | Usada para | Variável |
| --- | --- | --- |
| [Jolpica F1](https://github.com/jolpica/jolpica-f1) (formato Ergast) | classificação, calendário, resultados | `F1_JOLPICA_BASE` |
| [OpenF1](https://openf1.org) | pilotos (fotos, números), clima, stints, voltas | `F1_OPENF1_BASE` |
| MultiViewer | traçado e curvas dos circuitos | `F1_MULTIVIEWER_BASE` |

As três são públicas e não pedem chave. As chamadas acontecem **só no servidor**, com cache de 30 minutos, o que também respeita o limite de requisições do OpenF1.

**Para usar um servidor próprio** (um IP específico), defina as variáveis acima apontando para ele. O resto do app não muda, desde que o servidor responda no mesmo formato. Veja `.env.example`. Toda a integração fica em `src/lib/sources/` e `src/lib/f1.ts`.

Se alguma fonte cair, só a parte que depende dela mostra "indisponível". O resto da página continua funcionando.

## Animações

Feitas com [Motion](https://motion.dev):
- Transição entre páginas (`src/app/template.tsx`)
- Barra de progresso no topo durante a navegação
- Loading com as cinco luzes de largada
- Entrada escalonada de cards e linhas, números que contam até o valor e revelação ao rolar a página

Tudo respeita a preferência do sistema por movimento reduzido.

## Vídeos

O hero da tela inicial usa o player embutido do YouTube com vídeos do canal oficial da F1, mudo e em loop. Os IDs ficam em `src/lib/videos.ts`. Também podem ser trocados por `NEXT_PUBLIC_HERO_VIDEOS`, ou por um MP4 próprio em `NEXT_PUBLIC_HERO_VIDEO_MP4`.

## Stack

Next.js 15 (App Router, Server Components) · shadcn/ui · Tailwind CSS v4 · Motion · Recharts · Titillium Web + Inter.

## Como rodar

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev                  # http://localhost:3000
```

> Projeto não oficial, sem vínculo com a Formula 1, FIA ou equipes.
