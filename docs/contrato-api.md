# Contrato de dados do Dash F1

Este documento lista **todas as requisições** que o Dash F1 faz e o **formato exato do JSON** que ele espera receber em cada uma. Os valores estão como tipos (`"string"`, `0`, `true`), não como dados reais.

Os nomes, as maiúsculas e minúsculas e o aninhamento dos campos precisam ser exatamente estes. Campos marcados como `(opcional)` podem faltar, e qualquer campo a mais na resposta é ignorado.

---

## 1. Como os dados trafegam

```
Navegador  ──HTTP──▶  Servidor Next.js (Vercel)  ──HTTP──▶  APIs de dados
 (cliente)            (mediador: busca, cruza,              (Jolpica, OpenF1,
                       guarda em cache e monta a página)      MultiViewer)
```

- O **navegador nunca fala direto com as APIs de dados**. Quem faz as requisições é o servidor Next.js, que funciona como mediador.
- O servidor guarda cada resposta em cache por **1800 s**, configurável em `F1_REVALIDATE_SECONDS`.
- Todas as requisições são `GET`, com o cabeçalho `Accept: application/json` e timeout de **12 s**.
- As chamadas ao OpenF1 saem uma de cada vez, com pelo menos **350 ms** entre elas, por causa do limite de uso da API.
- Se uma fonte falhar, só a parte da página que depende dela mostra "indisponível". A exceção é a classificação, o calendário e os resultados da Jolpica: sem eles, a página mostra a tela de erro.

### Endereços (trocáveis por variável de ambiente)

| Fonte | URL base padrão | Variável para trocar (ex.: IP próprio) |
| --- | --- | --- |
| Jolpica (formato Ergast) | `https://api.jolpi.ca/ergast/f1` | `F1_JOLPICA_BASE` |
| OpenF1 | `https://api.openf1.org/v1` | `F1_OPENF1_BASE` |
| MultiViewer | `https://api.multiviewer.app/api/v1` | `F1_MULTIVIEWER_BASE` |

Exemplo com servidor próprio: `F1_JOLPICA_BASE=http://192.168.0.10:8080/ergast/f1`.

Nas URLs abaixo:
- `{BASE}` é a URL base da fonte;
- `{ano}` é a temporada, por exemplo `2026`;
- `{session_key}` e `{circuit_key}` são números que vêm de respostas anteriores.

---

## 2. Jolpica (formato Ergast)

Toda resposta da Jolpica vem dentro de um objeto `MRData`.

### 2.1 Classificação de pilotos

`GET {BASE}/{ano}/driverstandings.json`

```json
{
  "MRData": {
    "total": "string",
    "StandingsTable": {
      "StandingsLists": [
        {
          "DriverStandings": [
            {
              "positionText": "string",
              "points": "string",
              "wins": "string",
              "Driver": {
                "driverId": "string",
                "code": "string (opcional)",
                "permanentNumber": "string (opcional)",
                "givenName": "string",
                "familyName": "string",
                "nationality": "string",
                "dateOfBirth": "string AAAA-MM-DD (opcional)"
              },
              "Constructors": [
                {
                  "constructorId": "string",
                  "name": "string",
                  "nationality": "string"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

- O app lê só o **primeiro** item de `StandingsLists`.
- A lista `DriverStandings` deve vir em ordem de classificação.
- Em `Constructors`, o app usa a **última** equipe da lista.

### 2.2 Classificação de construtores

`GET {BASE}/{ano}/constructorstandings.json`

```json
{
  "MRData": {
    "total": "string",
    "StandingsTable": {
      "StandingsLists": [
        {
          "ConstructorStandings": [
            {
              "positionText": "string",
              "points": "string",
              "wins": "string",
              "Constructor": {
                "constructorId": "string",
                "name": "string",
                "nationality": "string"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### 2.3 Calendário da temporada

`GET {BASE}/{ano}.json?limit=100`

```json
{
  "MRData": {
    "total": "string",
    "RaceTable": {
      "Races": [
        {
          "season": "string",
          "round": "string",
          "raceName": "string",
          "date": "string AAAA-MM-DD",
          "time": "string HH:MM:SSZ (opcional)",
          "Circuit": {
            "circuitId": "string",
            "circuitName": "string",
            "Location": {
              "locality": "string",
              "country": "string",
              "lat": "string",
              "long": "string"
            }
          },
          "Sprint": {
            "date": "string AAAA-MM-DD",
            "time": "string HH:MM:SSZ (opcional)"
          }
        }
      ]
    }
  }
}
```

`Sprint` só aparece nas etapas com corrida sprint.

### 2.4 Resultado da última corrida

`GET {BASE}/{ano}/last/results.json`

O formato é o mesmo do calendário (2.3), com uma única corrida em `Races`, que traz também a lista `Results`:

```json
{
  "MRData": {
    "total": "string",
    "RaceTable": {
      "Races": [
        {
          "season": "string",
          "round": "string",
          "raceName": "string",
          "date": "string AAAA-MM-DD",
          "time": "string HH:MM:SSZ (opcional)",
          "Circuit": {
            "circuitId": "string",
            "circuitName": "string",
            "Location": {
              "locality": "string",
              "country": "string",
              "lat": "string",
              "long": "string"
            }
          },
          "Results": [
            {
              "number": "string",
              "position": "string",
              "positionText": "string",
              "points": "string",
              "grid": "string",
              "laps": "string",
              "status": "string",
              "Driver": {
                "driverId": "string",
                "code": "string (opcional)",
                "permanentNumber": "string (opcional)",
                "givenName": "string",
                "familyName": "string",
                "nationality": "string",
                "dateOfBirth": "string AAAA-MM-DD (opcional)"
              },
              "Constructor": {
                "constructorId": "string",
                "name": "string",
                "nationality": "string"
              },
              "Time": {
                "time": "string"
              },
              "FastestLap": {
                "rank": "string",
                "lap": "string",
                "Time": {
                  "time": "string"
                }
              }
            }
          ]
        }
      ]
    }
  }
}
```

- `Time` é opcional e só vem para quem terminou a corrida. No vencedor é o tempo total (`"1:35:21.231"`); nos demais é a diferença (`"+3.611"`).
- `FastestLap` é opcional. `rank: "1"` marca a volta mais rápida da corrida.
- `positionText` vale um número quando o piloto terminou. Valores como `"R"` indicam abandono.
- `grid: "0"` significa largada do pit lane.

### 2.5 Todos os resultados da temporada (paginado)

`GET {BASE}/{ano}/results.json?limit=100&offset={0, 100, 200, …}`

O formato é o mesmo de 2.4, mas com várias corridas em `Races`, cada uma com sua lista `Results`.

**Paginação:**
- `MRData.total` é o total de **resultados individuais** da temporada, e não de corridas.
- O app pede páginas de 100 até alcançar esse total.
- Uma mesma corrida pode aparecer em duas páginas seguidas. O app junta essas partes pelo campo `round`.

### 2.6 Todos os resultados de sprint da temporada (paginado)

`GET {BASE}/{ano}/sprint.json?limit=100&offset={0, 100, …}`

O formato é o mesmo de 2.5, mas a lista se chama **`SprintResults`** em vez de `Results`.

---

## 3. OpenF1

As respostas do OpenF1 são **listas JSON simples**, sem objeto em volta. Esses dados só existem a partir da temporada de 2023.

### 3.1 Corridas da temporada

`GET {BASE}/sessions?year={ano}&session_name=Race`

```json
[
  {
    "session_key": 0,
    "meeting_key": 0,
    "session_name": "string",
    "session_type": "string",
    "date_start": "string ISO 8601",
    "date_end": "string ISO 8601",
    "circuit_key": 0,
    "circuit_short_name": "string",
    "location": "string",
    "country_name": "string",
    "year": 0
  }
]
```

Com essa lista o app faz duas coisas:
- usa a última sessão já encerrada (`date_end` no passado) como "última corrida";
- considera que há uma corrida **ao vivo** se a hora atual estiver entre `date_start` e `date_end`.

### 3.2 Eventos (fins de semana) da temporada

`GET {BASE}/meetings?year={ano}` (pedido também para `{ano} - 1`)

```json
[
  {
    "meeting_key": 0,
    "meeting_name": "string",
    "circuit_key": 0,
    "circuit_short_name": "string",
    "location": "string",
    "country_name": "string",
    "country_code": "string",
    "date_start": "string ISO 8601",
    "year": 0
  }
]
```

O app usa esta lista para descobrir o `circuit_key` de cada corrida da Jolpica. A ligação é feita pela data (diferença de até 4 dias), pela cidade (`location`) ou pelo país (`country_name`).

### 3.3 Pilotos da corrida

`GET {BASE}/drivers?session_key={session_key}`

```json
[
  {
    "driver_number": 0,
    "full_name": "string",
    "name_acronym": "string",
    "first_name": "string (opcional)",
    "last_name": "string (opcional)",
    "team_name": "string",
    "team_colour": "string hex sem # (opcional)",
    "headshot_url": "string URL (opcional)",
    "country_code": "string (opcional)"
  }
]
```

- `name_acronym` (ex.: `NOR`) é o que liga este piloto ao `Driver.code` da Jolpica.
- `headshot_url` é a foto do piloto.

### 3.4 Clima da corrida

`GET {BASE}/weather?session_key={session_key}`

```json
[
  {
    "date": "string ISO 8601",
    "air_temperature": 0,
    "track_temperature": 0,
    "humidity": 0,
    "rainfall": 0,
    "wind_speed": 0,
    "pressure": 0
  }
]
```

O app tira a média de todas as amostras. Basta um `rainfall` maior que 0 em qualquer amostra para a corrida ser marcada como "com chuva".

### 3.5 Stints de pneus

`GET {BASE}/stints?session_key={session_key}`

```json
[
  {
    "driver_number": 0,
    "stint_number": 0,
    "lap_start": 0,
    "lap_end": 0,
    "compound": "string",
    "tyre_age_at_start": 0
  }
]
```

`compound` aceita estes valores: `SOFT`, `MEDIUM`, `HARD`, `INTERMEDIATE` e `WET`.

### 3.6 Voltas

`GET {BASE}/laps?session_key={session_key}`

```json
[
  {
    "driver_number": 0,
    "lap_number": 0,
    "lap_duration": 0.0,
    "is_pit_out_lap": true,
    "st_speed": 0
  }
]
```

- `lap_duration` é dado em segundos e pode vir `null`.
- `st_speed` é opcional e também pode vir `null`.

---

## 4. MultiViewer

### 4.1 Traçado do circuito

`GET {BASE}/circuits/{circuit_key}/{ano}`, com o cabeçalho **obrigatório** `User-Agent: dash-f1`

```json
{
  "x": [0],
  "y": [0],
  "rotation": 0,
  "corners": [
    {
      "number": 0,
      "letter": "string (opcional)",
      "angle": 0,
      "trackPosition": {
        "x": 0,
        "y": 0
      }
    }
  ]
}
```

- `x` e `y` são listas de coordenadas do mesmo tamanho, e cada par (`x[i]`, `y[i]`) é um ponto do traçado.
- `rotation` é a rotação em graus aplicada ao desenho.
- `corners` é opcional e marca as curvas numeradas.
- Se o ano pedido não existir, o app tenta `{ano} - 1`.

---

## 5. Ordem das requisições em um carregamento da página

1. **Em paralelo:**
   - Jolpica: 2.1, 2.2, 2.3, 2.4, 2.5 e 2.6;
   - OpenF1: 3.1 e 3.2 (para o ano atual e o anterior).
2. **OpenF1:** 3.3, usando o `session_key` da última corrida encontrada em 3.1.
3. **OpenF1:** 3.4, 3.5 e 3.6, também com esse `session_key`.
4. **MultiViewer:** 4.1 para:
   - a pista da última corrida;
   - a pista da próxima corrida;
   - até 8 pistas do calendário, usadas na animação de abertura.

   O `circuit_key` de cada pista vem de 3.2.

---

## 6. Outros tráfegos HTTP (não são JSON)

| O quê | Quem busca | De onde |
| --- | --- | --- |
| Fotos dos pilotos | Servidor Next.js (otimizador de imagens) → navegador recebe de `/_next/image` | `headshot_url` (3.3), hoje em `media.formula1.com` |
| Bandeiras dos países | Navegador | `https://flagcdn.com/w40/{código}.png` |
| Vídeo do hero | Build na Vercel (uma vez por deploy) → navegador recebe de `/media/hero.mp4` e `/media/hero.webm` | Wikimedia Commons (`HERO_VIDEO_SOURCE`) |
