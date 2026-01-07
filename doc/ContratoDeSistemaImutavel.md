# ContratoDeSistemaImutavel.md

> **Natureza:** Contrato constitucional e imutável do sistema — regras que AIs, agentes e humanos devem obedecer sem negociação automática.
> **Objetivo:** reduzir drift, tokens e delírio de modelos; impor limites executáveis e claros.

---

## 1. Princípio central (Modelo de Tenant)

* **Workspace é o tenant raiz.**
* **Todo dado de negócio TEM workspaceId.**
* **Toda query de negócio FILTRA por workspaceId.**

> Exceções somente para domínios explícitos e globais (por exemplo: `admin/global`) e devem ser aprovadas por revisão arquitetural.

---

## 2. Escopo e Aplicabilidade

* Este documento **não** é tutorial nem guia de estilo.
* É **constitucional**: implementações que violarem suas regras são consideradas inválidas até serem revistas.
* Deve ser citado textualmente em prompts para AIs: “Obedeça o `ContratoDeSistemaImutavel.md`.”

---

## 3. Arquitetura em Camadas (Regra Estrita)

```
UI          ← src/app/, src/components/
Application ← src/domains/*/actions/, src/server/
Domain      ← src/domains/*/services/
Infra       ← src/lib/server/, prisma/, providers/
Types       ← src/types/, src/domains/*/types.ts
```

### Direção de dependência (imutável)

* UI pode importar Application, Domain (apenas interfaces/contratos) e Types.
* Application pode importar Domain, Infra e Types.
* Domain só pode importar Types. (Não importar Infra, DB, frameworks ou libs de execução.)
* Infra pode importar Types e libs externas.
* Types não importa nada.

---

## 4. Responsabilidades de Pastas (normativo)

* `src/types/` — Tipos compartilhados, contracts e value objects. **Sem importação de implementação.**
* `src/domains/{name}/types.ts` — Types específicos do domínio.
* `src/domains/{name}/services/` — Lógica de negócio pura e determinística.
* `src/domains/{name}/actions/` — Server Actions / orquestração (Application layer).
  *Obs:* `actions` NÃO faz parte do Domain conceitual; é parte de Application.
* `src/app/` — Rotas e composição de UI (Next.js app router).
* `src/components/` — Componentes React (UI apenas).
* `src/lib/server/` — Adapters de infra: DB clients, billing adapter, mailer, upload.
* `prisma/` — Esquema do banco; mapping e migrations.

---

## 5. Regras de Domain (não negociáveis)

* Código de Domain é **framework‑agnostic**: JavaScript/TypeScript puro, funções ou classes puras que recebem e retornam dados.
* Domain NÃO pode:

  * importar React, Next, hooks ou API de rotas;
  * acessar DB diretamente (usar abstrações de Infra via Application);
  * manter estado global mutável;
  * executar efeitos colaterais (fetch, timers, IO).
* Domain deve ser determinístico e testável isoladamente.

---

## 6. Regras de Application / Server Actions

* Mutations e orquestrações ocorrem em Application / Server Actions.
* Todo arquivo de Server Action **deve** começar com `"use server"`.
* Validação de autenticação e autorização por workspace ocorre em Application.
* Application pode adaptar Domain para Infra (ex.: transformar IDs, abrir transações) mas **não** introduz regras de negócio.

---

## 7. Data Access e Segurança (normas)

* Acesso ao DB é **server‑only**. Componentes client não acessam DB diretamente.
* **Prisma** (ou outro client) vive em `src/lib/server/*` e é usado por adaptadores na camada Infra/Application.
* **Proibido:** consultas sem filtro de tenant.

**Exemplo proibido:**

```ts
// ❌ proibido
prisma.order.findMany({})
```

**Exemplo obrigatório:**

```ts
// ✅ obrigatório
prisma.order.findMany({ where: { workspaceId } })
```

---

## 8. Pagamentos e Billing

* Implementação de Stripe/Pagamentos existe **somente** em `src/lib/server/payment.ts` (ou adaptador equivalente).
* Domains interagem com billing APENAS via interfaces/serviços de abstração (ex.: `BillingService`).
* Features e business logic nunca conhecem detalhes de implementação de pagamentos.

---

## 9. Convenções Normativas (curtas)

* Arquivos: `kebab-case.ts` / `kebab-case.tsx`
* Tipos / Classes: `PascalCase`
* Funções / variáveis: `camelCase`
* Constantes / Enums: `SCREAMING_SNAKE_CASE`
* IDs: `cuid()` ou UUID, consistente por projeto
* Validações: `zod` para contratos (preferência), mas a validação de domínio deve viver no Domain

---

## 10. Imutáveis (lista curta — nunca quebrar sem revisão)

1. Workspace é o tenant raiz.
2. Todo dado de negócio TEM `workspaceId`.
3. Toda query de negócio FILTRA por `workspaceId`.
4. Domain NÃO tem dependência de framework.
5. Billing é isolado em infra/adapter.
6. Mutations são server‑first (Server Actions).
7. Wallet não pode ficar com saldo negativo sem regra explícita de overdraft.

---

## 11. Proibições Absolutas (exemplos rápidos)

* Domain importando UI ou Next (`import { Button } from "~/components"`, `import { redirect } from 'next/navigation'`) — proibido.
* Types importando implementação (`import { prisma } from "~/lib/server/db"`) — proibido.
* Queries sem `workspaceId` — proibido.
* Lógica de negócio em componentes React — proibido.
* Stripe diretamente no Domain ou UI — proibido.

---

## 12. Checklist de Implementação (pré‑merge)

* [ ] Código está no local correto por camada?
* [ ] Todas as queries de negócio possuem `workspaceId` no `where`?
* [ ] Domain não importa infra/framework?
* [ ] Mutations em Server Actions com `"use server"`?
* [ ] Billing chamado apenas via adaptador em `src/lib/server/`?
* [ ] Tipos alterados foram revisados e são compatíveis retroativamente?

---

## 13. Política de Mudança

* Mudanças neste contrato exigem **revisão arquitetural** (design review) e aprovação por responsável técnico.
* Versões: `ContratoDeSistemaImutavel.md v1` → `v2` etc.
* Nunca edite retroativamente sem registrar versão nova.

---

## 14. Mentalidade de Aplicação (enforcement)

* Ao dúvida, **isolar**.
* Preferir domain puro a conveniência.
* Tratamento de dívida técnica passa por regra, não por exceção.

---

**Status:** ativo — v1
**Autoria:** Tai + Zara ORACLE

---

*Coloque este arquivo no repositório como `ContratoDeSistemaImutavel.md` e referencie-o em prompts e checklists de CI.*
