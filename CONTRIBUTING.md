# Como contribuir

Obrigado pelo interesse! Este documento explica como reportar problemas,
sugerir mudanças e enviar código para o `devlog`.

## 🐛 Reportando bugs

Abra uma issue usando o template **Bug report**. Para problemas na CLI, inclua
sempre o comando exato que você executou e a saída completa do terminal — o
`devlog` não mostra stack trace de propósito, então o output é a única
informação disponível.

## 💡 Sugerindo funcionalidades

Abra uma issue com o template **Feature request** descrevendo primeiro o
**problema**. O `devlog` é um CLI deliberadamente pequeno; toda sugestão é
avaliada por dois critérios:

1. Resolve algo que realmente atrapalha?
2. Cabe no escopo de um CLI pessoal, sem virar um framework?

## 🔧 Enviando código

1. **Fork** e crie um branch descritivo:

   ```bash
   git checkout -b feat/exportar-csv
   ```

2. **Instale e valide o ambiente**:

   ```bash
   npm install
   npm test
   ```

3. **Antes de abrir o PR**, rode o mesmo que o CI executa:

   ```bash
   npm run typecheck   # tipos estritos
   npm run build       # compila para dist/
   npm test            # suíte completa
   npm audit           # sem vulnerabilidades altas
   ```

4. **Commite seguindo [Conventional Commits](https://www.conventionalcommits.org/pt-br/)**:

   ```text
   feat: adiciona comando de exportação em CSV
   fix: corrige streak ao atravessar a virada de ano
   test: cobre o cálculo em ano bissexto
   docs: documenta a variável DEVLOG_PATH
   chore: atualiza dependências de desenvolvimento
   ```

5. **Abra o Pull Request** preenchendo o template.

## 📏 Critérios de aceitação de um PR

- [ ] O código tem testes cobrindo o comportamento novo ou corrigido
- [ ] `npm run typecheck` passa **sem** usar `any` ou `@ts-ignore` para escapar
      de erros de tipo
- [ ] As funções novas em `stats.ts` continuam **puras** (sem I/O, sem relógio)
- [ ] `npm test` e `npm audit` passam localmente
- [ ] Nenhum segredo ou dado real commitado

## 🧭 Onde mexer em cada coisa

| Quer mexer em... | Vá para |
| :--- | :--- |
| Um comando novo | `src/index.ts` |
| Cálculos de estatística | `src/stats.ts` (e os testes em `tests/stats.test.ts`) |
| Leitura/escrita do arquivo | `src/storage.ts` |
| Como o terminal é impresso | `src/format.ts` |
| Formato dos dados | `src/types.ts` **e** o schema Zod em `src/storage.ts` |

> ⚠️ Mudar o formato do arquivo exige atualizar **os dois** últimos lugares ao
> mesmo tempo — é o contrato de compatibilidade do arquivo.

## 💬 Código de conduta

Seja respeitoso. Críticas devem ser sobre o **código**, nunca sobre a pessoa.

## 📄 Licença

Ao contribuir, você concorda que sua contribuição seja licenciada sob a
[licença MIT](LICENSE) do projeto.