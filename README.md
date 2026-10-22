# Dash F1 🏁

Dashboard de **ciência de dados da Fórmula 1** em uma **página única**, com visual escuro e tecnológico. Cada equipe tem a sua cor, usada em todos os gráficos.

1. **Abertura:** o loading passa por todos os pilotos do grid, com as fotos em sequência sobre os traçados das pistas da temporada.
2. **Hero em tela cheia:** vídeo de corrida servido pelo próprio site, leaderboard (gap, pneu final, melhor volta, bandeira, busca) e painel Overview. No painel, os carros circulam pela pista com os gaps reais. Ao rolar, o hero encolhe e vira um card.
3. **A temporada em uma frase:** texto que se revela palavra por palavra com a rolagem.
4. **Pilotos:** carrossel arrastável com autoplay (Embla, base do Carousel do shadcn).
5. **Ranking:** foto do piloto no lugar do número. Ao passar o mouse, ou tocar no celular, a linha cresce e mostra todos os números da temporada: pódios, poles, médias, posições ganhas, % dos pontos da equipe e resultado por etapa.
6. **Análise da corrida:** pista e clima, estratégia de pneus e ritmo em box plot.
7. **Campeonato:** evolução de pontos, construtores e cores das equipes.
8. **Calendário:** trilho horizontal fixado, que desliza conforme a rolagem.

O seletor de temporada vai de 2000 até hoje, via `?season=AAAA`. Pneus, voltas e clima existem a partir de 2023.

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

Feitas com [Motion](https://motion.dev) e [Lenis](https://lenis.darkroom.engineering):
- Rolagem suave com inércia
- Hero que encolhe ao rolar e texto revelado pela rolagem, feitos com **animações CSS guiadas pela rolagem** (`animation-timeline`), que rodam no navegador sem JavaScript a cada quadro
- Calendário com scroll horizontal fixado
- Carrossel, linhas que expandem, números que contam até o valor e barra de progresso ao trocar de temporada

Tudo respeita a preferência do sistema por movimento reduzido. Para manter a fluidez:
- sem `backdrop-filter` sobre o vídeo;
- vídeo e traçado animado pausam fora da tela;
- seções abaixo da dobra usam `content-visibility: auto`.

## Vídeo

O vídeo do hero **não depende do YouTube nem de CDN externa no navegador**. O script `scripts/fetch-media.mjs` roda antes do `next build`:
1. Baixa o vídeo do Wikimedia Commons.
2. Gera um MP4 H.264 e um pôster com o `ffmpeg-static`.
3. Salva tudo em `public/media/`.

Assim o arquivo é servido pelo próprio domínio do site. As fotos dos pilotos também passam pelo otimizador de imagens do Next, no mesmo domínio.

Vídeo: [“2021 Russian Grand Prix – start for warm-up”](https://commons.wikimedia.org/wiki/File:2021_Russian_Grand_Prix_-_start_for_warm-up.webm), por rubin16, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Para trocar, defina `HERO_VIDEO_SOURCE` com a URL de outro WebM.

## Stack

Next.js 15 (App Router, Server Components) · shadcn/ui · Tailwind CSS v4 · Motion · Lenis · Embla · Recharts · Geist Sans + Geist Mono.

## Como rodar

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev                  # http://localhost:3000
```

> Projeto não oficial, sem vínculo com a Formula 1, FIA ou equipes.
