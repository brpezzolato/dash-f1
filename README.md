# Dash F1 🏁

Dashboard de Fórmula 1 com visual editorial inspirado nas páginas de equipes: fundo verde-água, cards escuros e um **carro de F1 em 3D** que sai da moldura do hero.

Os dados vêm da API pública [Jolpica F1](https://github.com/jolpica/jolpica-f1), sucessora da Ergast. Ela é gratuita e não precisa de chave.

## Stack

- **Next.js 15** (App Router, Server Components). Os dados são buscados no servidor com cache de 30 minutos.
- **shadcn/ui** (estilo new-york, Radix + Tailwind CSS v4): Card, Table, Tabs, Select, Badge, Progress, Skeleton.
- **Three.js** com React Three Fiber e drei. O carro é modelado só com geometria, sem arquivos externos, e tem iluminação de estúdio procedural.
- **Motion** para as animações de interface.
- **Recharts** para o gráfico de evolução de pontos.

## O que tem no MVP

- **Hero:** nome do líder do campeonato com revelação por máscara, resumo da temporada e countdown ao vivo para a próxima corrida. O carro 3D entra pela direita freando, com rodas girando, flutuação suave e parallax com o mouse.
- **Ticker:** faixa rolante com a classificação, estilo transmissão de TV.
- **Destaques:** vencedor da última corrida, manchete com a vantagem do líder, líder de construtores, volta mais rápida e vitórias do líder.
- **Classificação:** abas de pilotos e construtores com barras animadas na cor de cada equipe.
- **Evolução no campeonato:** pontos acumulados por etapa do top 6, somando corridas e sprints.
- **Última corrida:** resultado completo, posições ganhas ou perdidas desde o grid e volta mais rápida.
- **Calendário:** etapas concluídas, a próxima em destaque e os fins de semana com sprint.
- **Seletor de temporada:** de 2000 até a atual, via `?season=AAAA`.

## Como rodar

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

`F1_API_BASE` é opcional e troca a URL base da API, por exemplo para um espelho ou um mock local. O padrão é `https://api.jolpi.ca/ergast/f1`.

## Estrutura

```
src/
├── app/                 # layout, página, loading e erro
├── components/
│   ├── hero/            # hero e cena 3D do carro (car-scene.tsx)
│   ├── ui/              # componentes shadcn/ui
│   └── *.tsx            # seções do dashboard
└── lib/
    ├── f1.ts            # cliente da Jolpica API (somente servidor)
    ├── teams.ts         # cores das equipes
    └── types.ts
```

> Projeto não oficial, sem vínculo com a Formula 1, FIA ou equipes.
