# Arquitetura de rede do Dash F1

```
        API pública de F1
   (Jolpica · OpenF1 · MultiViewer)
                 │  HTTP GET (várias requisições)
                 ▼
┌──────────────────────────────────┐
│ PC 1 · Coletor · 172.16.29.68    │  node coletar-dados.mjs
│ publica /dados.json na porta 3000│  → public/dados.json
└──────────────────────────────────┘
                 │  HTTP GET http://172.16.29.68:3000/dados.json
                 ▼
┌──────────────────────────────────┐
│ PC 2 · Arthur · cliente/transf.  │  node transferir.mjs --pc3 …
└──────────────────────────────────┘
                 │  HTTP POST http://<IP_DO_PC3>:3000/api/receber
                 │  Content-Type: application/json · corpo = mesmo JSON
                 ▼
┌──────────────────────────────────┐
│ PC 3 · Dashboard (este app)      │  POST /api/receber → grava o pacote
│ http://<IP_DO_PC3>:3000          │  /  → dashboard com os dados recebidos
└──────────────────────────────────┘
```

Os três computadores precisam estar na mesma rede, com a **porta 3000 liberada no firewall** do PC 1 e do PC 3. O PC 2 não recebe conexões, só as faz.

O PC 1 precisa de internet, porque é ele que consulta a API pública. O PC 3 precisa de internet só para as fotos dos pilotos e as bandeiras; os dados em si chegam pela rede local.

---

## PC 1 — Coletor (172.16.29.68)

Use o script [`pc1/coletar-dados.mjs`](pc1/coletar-dados.mjs). Ele precisa de Node 18 ou mais novo e não tem dependências.

1. Copie `coletar-dados.mjs` para a raiz do projeto do PC 1, a pasta que tem `public/`.
2. Gere os dados:
   ```bash
   node coletar-dados.mjs
   # opções: --temporada 2025   --saida ./public/dados.json   --intervalo 10 (minutos)
   ```
   O script grava `public/dados.json`, com cerca de 400 KB a 2 MB.
3. Publique na porta 3000, ouvindo em todas as interfaces:
   ```bash
   npm run dev -- -H 0.0.0.0 -p 3000
   ```
   No Next.js em modo produção (`next start`), só os arquivos que já estavam em `public/` **no momento do build** são servidos. Por isso, se usar `next start`, rode o coletor antes do `npm run build`. Com `npm run dev`, o arquivo novo é servido na hora.
4. Teste em outro computador: abra `http://172.16.29.68:3000/dados.json`.

## PC 2 — Arthur (cliente e transferência)

Use o script [`pc2/transferir.mjs`](pc2/transferir.mjs). Ele também precisa de Node 18 ou mais novo e não tem dependências.

```bash
node transferir.mjs --pc3 http://<IP_DO_PC3>:3000/api/receber
# opções: --pc1 http://172.16.29.68:3000/dados.json (padrão)   --intervalo 30 (segundos)
```

O que ele faz:
1. `GET http://172.16.29.68:3000/dados.json`
2. `POST http://<IP_DO_PC3>:3000/api/receber`, enviando o mesmo JSON, com `Content-Type: application/json` e o cabeçalho `X-Origem: <ip do PC 2>`.

Saída esperada:

```
[PC 2] 14:03:12
  GET  http://172.16.29.68:3000/dados.json
       ← 200 OK · 414 KB · 112 ms
  POST http://172.16.29.68:3000/api/receber
       ← 201 Created · 36 respostas aceitas · 24 ms
  ✓ Transferência concluída em 136 ms
```

## PC 3 — Dashboard (este repositório)

```bash
npm install
npm run build
npm start -- -H 0.0.0.0 -p 3000
```

- Até chegar o primeiro pacote, a página mostra **"Aguardando dados do PC 2"**. Quando o PC 2 envia, ela atualiza sozinha, sem recarregar a aba.
- No topo do dashboard aparece o selo **"Rede · PC 2 (ip) · hora"**, com a origem e o horário do último recebimento.
- `GET http://<IP_DO_PC3>:3000/api/receber` mostra o status do último pacote recebido.
- O pacote recebido fica gravado em `.dados/recebido.json` e sobrevive a reinícios do servidor.

A variável `F1_FONTE` controla de onde vêm os dados. O padrão é `rede`. Com `publica`, o app volta a consultar as APIs públicas diretamente, e com `auto` ele usa o pacote se houver e a API pública se não houver.

O formato do `dados.json` e as respostas de `/api/receber` estão em [`docs/contrato-api.md`](../docs/contrato-api.md#0-pacote-da-rede-dadosjson).
