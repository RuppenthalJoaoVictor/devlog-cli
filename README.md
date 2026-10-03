# devlog

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Tests](https://img.shields.io/badge/tests-42%20passing-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

CLI em **TypeScript** para registrar sessões de estudo e acompanhar a evolução no
tempo — total de horas, média por sessão, distribuição por assunto e sequência de
dias estudados.

Feito como projeto de portfólio para demonstrar TypeScript com tipagem estrita,
testes unitários e boas práticas de CLI.

## 📸 Exemplo de saída

```text
$ devlog stats

📊 Resumo de estudos

Total:        2h 45min em 3 sessões
Média:        55min por sessão
Dias ativos:  2
Esta semana:  2h 45min
Últimas 4sem: 2h 45min

Por assunto:
  TypeScript  1h 30min ██████████ 100%
  Python      1h 15min ████████ 83%

Últimos dias:
  2026-10-03  2h 15min  (2x)
  2026-10-02  30min     (1x)

Sequência atual: 2 dia(s) · recorde: 2 dia(s)
```

## 🎯 O problema que resolve

"Eu estudei bastante essa semana?" é uma pergunta que quase ninguém consegue
responder com precisão. Aplicativos de produtividade pedem login, cobram
assinatura e exigem preencher formulários. O `devlog` registra em um comando e
responde na hora, offline, com os dados em um arquivo de texto legível no seu
próprio computador.

## ✨ Funcionalidades

- ✅ Registro rápido: `devlog add "Python" --minutes 45`
- ✅ Relatório com total, média, dias ativos e tempo da semana
- ✅ Distribuição de tempo por assunto com barra visual
- ✅ **Sequência (streak)** de dias consecutivos, com recorde histórico
- ✅ Filtros por assunto e por intervalo de datas
- ✅ Persistência em JSON com validação de esquema (Zod)
- ✅ Escrita **atômica** em arquivo — não corrompe o histórico
- ✅ Treatamento de erros com mensagens claras e código de saída ≠ 0
- ✅ 42 testes unitários cobrindo datas, estatísticas e persistência
- ✅ CI com typecheck e testes

## 🛠️ Tecnologias

| Camada | Tecnologia |
| :--- | :--- |
| Linguagem | TypeScript 5.9 (`strict` + `noUncheckedIndexedAccess`) |
| Runtime | Node.js 20+ (ESM nativo) |
| CLI | Commander |
| Validação | Zod |
| Testes | Vitest |
| Persistência | JSON em disco com escrita atômica |

## 🏗️ Estrutura do projeto

```text
devlog-cli/
├── src/
│   ├── index.ts       # ponto de entrada e definição dos comandos
│   ├── dates.ts       # utilitários de data em YYYY-MM-DD local
│   ├── stats.ts       # funções puras de agregação e streak
│   ├── storage.ts     # leitura/escrita atômica e validação com Zod
│   ├── format.ts      # renderização das tabelas e do relatório
│   └── types.ts       # tipos de domínio
├── tests/
│   ├── dates.test.ts     # 8 testes — viradas de mês, ano, bissexto
│   ├── stats.test.ts     # 15 testes — streaks e agregações
│   └── storage.test.ts   # 19 testes — round-trip e erros de arquivo
└── .github/workflows/ci.yml
```

## 🚀 Como executar

**Pré-requisitos:** Node.js 20 ou superior.

```bash
# Clone e entre na pasta
git clone https://github.com/RuppenthalJoaoVictor/devlog-cli.git
cd devlog-cli

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm run dev -- stats
```

Para usar como comando global:

```bash
npm link
devlog --help
```

## 📡 Comandos

```bash
# Registrar uma sessão
devlog add "Python" --minutes 45 --note "async/await"

# Registrar com outra data
devlog add "TypeScript" --minutes 90 --date 2026-10-01

# Ver todas as sessões
devlog list

# Filtrar
devlog list --topic python
devlog list --from 2026-10-01 --to 2026-10-31

# Relatório completo
devlog stats

# Tempo por assunto
devlog topics

# Remover uma sessão
devlog remove 3

# Descobrir onde os dados ficam salvos
devlog where
```

Os dados são gravados em `~/.devlog/sessions.json`. Para usar outro caminho
(útil em testes e sandboxes), defina a variável de ambiente:

```bash
DEVLOG_PATH=/caminho/meu/arquivo.json devlog stats
```

## 🧪 Testes e qualidade

```bash
npm test           # roda os 42 testes
npm run test:watch # modo watch
npm run typecheck  # verificação de tipos estrita
npm run build      # compila para dist/
```

## 🧠 Decisões de projeto

- **JSON em vez de SQLite.** O formato é legível, versionável com o Git e
  dispensa dependência nativa — importante para um CLI que precisa instalar
  rápido. O schema versionado (`version: 1`) deixa a migração para outro
  formato trivial depois.
- **Escrita atômica.** Os dados são escritos em `arquivo.tmp` e depois
  renomeados com `rename`, que é atômico no mesmo filesystem. Um `Ctrl+C` no
  meio da escrita não corrompe o histórico.
- **Datas em `YYYY-MM-DD` local, nunca em UTC.** Se as Midnight UTC, uma sessão
  das 22h de um dia cairia no relatório do dia seguinte.
- **Estatísticas como funções puras.** `stats.ts` não toca em disco nem no
  relógio: recebe sessões e devolve o resultado, com a data de referência
  injetada por parâmetro. É o que torna os testes determinísticos.
- **Streak tolerante a um dia de folga.** Se você não estudou hoje, mas estudou
  ontem, a sequência continua — zerar por não ter estudado *ainda* seria
  desincentivar, e não medir progresso.
- **Erros tratados explicitamente.** Entradas inválidas saem com código 1 e
  mensagem legível, em vez de stack trace.

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).

## 👤 Autor

**João Victor Amaral Ruppenthal** — [@RuppenthalJoaoVictor](https://github.com/RuppenthalJoaoVictor)