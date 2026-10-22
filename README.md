# Dash F1 🏁

Dashboard de dados da Fórmula 1 feito com **React + TypeScript + Vite** e gráficos em **Recharts**.
Os dados vêm da [Jolpica F1 API](https://github.com/jolpica/jolpica-f1), sucessora gratuita e aberta da antiga Ergast API. Não precisa de chave de API.

## Funcionalidades

- **Indicadores**: líder do campeonato de pilotos (e vantagem sobre o 2º), líder de construtores, etapas disputadas e contagem regressiva para a próxima corrida
- **Evolução de pontos**: pontos acumulados por etapa dos 6 primeiros pilotos (corridas + sprints), na cor de cada equipe (o segundo piloto da equipe aparece tracejado)
- **Classificação de pilotos**: posição, equipe, vitórias e pontos
- **Classificação de construtores**: gráfico de barras na cor de cada equipe
- **Última corrida**: resultado completo, posições ganhas/perdidas em relação ao grid e volta mais rápida
- **Calendário**: todas as etapas da temporada, com destaque para a próxima e indicação de fins de semana com sprint
- **Seletor de temporada**: de 2000 até a temporada atual
- Tema claro/escuro automático e layout responsivo

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:5173
npm run build    # build de produção em dist/
npm run preview  # serve o build localmente
```

## Estrutura

```
src/
├── api.ts            # cliente da Jolpica API (com cache e paginação)
├── types.ts          # tipos das respostas da API
├── teams.ts          # cores das equipes
├── useAsync.ts       # hook simples de carregamento de dados
├── App.tsx           # layout do dashboard
└── components/       # cards: KPIs, classificações, gráficos, calendário
```

> Projeto não oficial, sem vínculo com a Formula 1, FIA ou equipes.
