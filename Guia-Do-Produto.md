# Seumei — Guia do Produto (AI-first)

**Objetivo:** documento para guiar a AI (e a equipe) a desenvolver a Seumei do começo ao fim — arquitetura, UX, features, casos de uso genéricos, critérios de aceite, prompts reutilizáveis e entregáveis.

> Nota: este guia foi escrito para que uma IA consiga, a partir da base já pronta, gerar código, UI, testes e documentação sem passos manuais além da revisão humana.

---

## 1. Resumo executivo

Seumei é um sistema para MEIs onde usuários criam accounts, configuram workspaces e mantêm um catálogo online (produtos/serviços). É modular, multi-tenant, com temas/templates, billing opcional e integrações. O sistema serve tanto para uso rápido (MVP) quanto para escalas com customizações. HOFMesh é a camada tecnológica de base.

**Princípio guia:** "keep dashboards as dashboards" — elementos padrão não precisam reinventar propósito. Ex.: um dashboard financeiro é um dashboard financeiro: receitas, despesas, saldo, tendências, ações rápidas.

---

## 2. Objetivos do produto

* Entregar MVP útil para MEIs em 1-3 semanas (fluxo: cadastro → workspace → catálogo → vendas básicas)
* Permitir autonomia máxima da AI para criar features completas: UI, backend, testes, docs e deploys
* Manter flexibilidade para temas, templates e branding do workspace
* Facilitar integrações (pagamento, envio, contabilidade)

---

## 3. Personas

* **MEI solo** — quer catalogar serviços, gerar orçamentos, emitir notas e acompanhar caixa.
* **Micro-agente/consultor** — cria e gerencia workspaces de clientes; precisa de templates rápidos.
* **Admin da Matriz (Tai)** — visão consolidada, governança, métricas e orquestração entre apps.
* **Usuário final / Cliente** — visita catálogo, solicita serviço, paga.

---

## 4. Conceitos centrais (terminologia)

* **Workspace**: espaço do usuário/empresa. Contém catálogo, temas, configurações e integrações.
* **Catalogo**: lista de produtos e serviços com preços, variações e tags.
* **Template/Theme**: conjunto de estilos, paleta, layout e CTAs.
* **Planos (Billing)**: grátis/freemium + planos pagos com recursos extras.
* **Seumei Core**: regras de negócio, orquestração, autenticação e multi-tenant.

---

## 5. MVP — features mínimas

**Fluxo essencial:**

1. Cadastro de usuário (email + social) e verificação
2. Criar workspace (nome, slug, tema base)
3. Criar catálogo (items com título, descrição, preço, imagem)
4. Página pública do workspace (catalog online)
5. Dashboard básico (vendas, pedidos, caixa)
6. Gerar orçamento & enviar por link
7. Integração com gateway de pagamento (placeholder)

**Regras de usabilidade MVP:**

* Onboarding em 3 passos (Cadastro → Criar workspace → Adicionar 1 item)
* CTAs claros: "Criar catálogo", "Compartilhar link", "Gerar orçamento"
* Defaults sensatos: template limpo, moeda local, horário local

---

## 6. Arquitetura (alto nível)

**Camadas:**

* Frontend: Next.js (app router), componentes atômicos, design tokens
* Backend: Node/Typescript + Prisma (Postgres)
* Storage: S3-compatible para assets
* Auth: JWT + session, OAuth para terceiros
* Orquestração: HOFMesh (serviços), mensageria leve para jobs
* Observabilidade: logs + métricas (Prometheus/Datadog)

**Multi-tenant:** schema por tenant ou row-level (definir para MVP: row-level com tenant_id em todas as tables principais).

---

## 7. Modelos de dados (esqueleto)

Exemplo mínimo de entidades (nomes genéricos):

```sql
User(id, email, password_hash, name, role, created_at)
Workspace(id, owner_user_id, name, slug, theme_id, created_at)
CatalogItem(id, workspace_id, title, description, price_cents, currency, sku, active)
Order(id, workspace_id, customer_name, total_cents, status, created_at)
Theme(id, name, values_json)
```

Inclua índices por `workspace_id`, `slug`, `created_at`.

---

## 8. UI/UX — guidelines e padrões

* **Coerência:** componentes reutilizáveis (Card, Table, Modal, Form, EmptyState).
* **Usabilidade:** menos cliques que telas; evitar sobrecarga de opções no início.
* **Responsividade:** mobile-first para MEIs que usam celular.
* **Design de dashboards:** seguir o contrato: 1) KPI principal (saldo), 2) lista de ações recentes, 3) CTA de ação rápida. Não inventar widgets "surpresa".
* **Exemplo (financeiro):** Painel mostra: Receita Mês, Despesa Mês, Saldo Atual, Últimas 10 transações, Gráfico de tendência (30 dias), Ação "Emitir nota".
* **Templates:** cada template define tipografia + paleta + disposição de CTAs — não altera o propósito dos componentes.

---

## 9. Casos genéricos de uso (padrões que não mudam)

> Sempre trate estes como *contracts* — a AI não deve reinventar, apenas adaptar conteúdo/visual.

1. **Dashboard financeiro** — sempre: KPIs, lista de transações, gráfico, ações.
2. **Página de catálogo pública** — SEO-friendly, listagem filtrável, botão de contato/compra.
3. **Gerar orçamento** — formulário + template de PDF; link compartilhável.
4. **Cadastro de produto** — título, preço, unidade, tags, imagens.
5. **Onboarding** — checklist simples com 3 ações (completar perfil, adicionar item, compartilhar link).
6. **Admin console** — visão por workspace, métricas agregadas, logs de eventos.

---

## 10. Regras e restrições (decisões pragmáticas)

* Não reinventar nomenclatura padrão (ex.: "Dashboard financeiro" não vira "Energy Manager").
* Evitar features que exigem certificação (ex.: integração fiscal complexa) no MVP — colocar como "connector" com stub.
* Temas: permitir troca de cores e logo, mas manter layout dos componentes para evitar regressões.
* A IA deve sempre criar testes unitários e e2e para cada feature entregue.

---

## 11. API & Contratos

* Fornecer OpenAPI/REST + GraphQL opcional.
* Contratos devem conter exemplos de requests/responses.
* Exemplo endpoint minimal:

`POST /api/workspaces` -> body: `{ name, slug, owner_id }` -> returns workspace object

Sempre versionar `/api/v1/...`.

---

## 12. AI-first: prompt mestre e sub-prompts

**Prompt mestre (usar como base):**

> "Você é a AI dev. Tem acesso ao repositório base da Seumei com infra, schemas e components. Seu objetivo: entregar a feature X completa — backend, migrations, endpoints, frontend (páginas e componentes), testes unitários e e2e, documentação e PR ready. Priorize padrões do guia de produto. Para cada PR inclua: descrição, arquivos alterados, comandos para rodar localmente, e testes."

**Sub-prompts padrão (templates):**

* "Gerar migration SQL para a entidade Y e fornecer seed minimal"
* "Criar endpoint REST CRUD para CatalogItem com validação e testes"
* "Criar página Next.js /workspaces/[slug]/catalog com SSR e fallback"
* "Gerar componente React CardProduct com props: {title, price, image, onClick} e storybook story"
* "Gerar testes Playwright para fluxo: adicionar item -> publicar -> acessar página pública"

Inclua sempre: 1) resumo do que será feito; 2) lista de arquivos a criar; 3) comandos para rodar; 4) critérios de aceite.

---

## 13. Critérios de aceite (cada task)

* Backend: endpoints passam em testes unitários, cobertura mínima 80% nas funções críticas.
* Frontend: componentes com storybook + testes visuais (playwright snapshot) e responsividade.
* Infra: migrations aplicam sem perda de dados; assets armazenados corretamente.
* UX: onboarding completo em <= 3 passos; CTAs visíveis.

---

## 14. QA e Testes

* Unit: Jest/TS
* Integration: supertest / prisma test db
* E2E: Playwright — cenários: signup -> create workspace -> add item -> open public link -> create order
* Test data: script `scripts/seed-dev.ts` com 3 workspaces e 10 items.

---

## 15. Observabilidade e métricas iniciais

Métricas mínimas para MVP:

* Usuários ativos/dia
* Workspaces criados/dia
* Itens no catálogo por workspace
* Vendas / conversões (orçamentos que viram pedido)
* Latência média do API (p50/p95)

Logs estruturados com `workspace_id` em contexto.

---

## 16. Segurança e compliance

* Proteja rotas com tenant scoping.
* Sanitize uploads (images) e limitar tamanho.
* GDPR/Lei de proteção de dados: armazenar apenas o necessário e permitir exclusão do workspace.

---

## 17. Roadmap recomendado (fases)

* **Fase 0 (setup)**: infra, auth, DB, seed dev
* **Fase 1 (MVP)**: cadastro, workspace, catálogo, página pública, dashboard básico
* **Fase 2 (growth)**: payments, templates, SEO, analytics
* **Fase 3 (enterprise)**: integrações contábeis, multi-orga, roles avançadas

---

## 18. Entregáveis & checklist para cada feature

* [ ] Descrição da feature em 3 frases
* [ ] Migration & model
* [ ] Endpoint(s) e contratos (OpenAPI)
* [ ] Frontend (page + components)
* [ ] Tests (unit + e2e)
* [ ] Storybook
* [ ] Documentação e ADR se relevante

---

## 19. Exemplos rápidos (comportamentos esperados)

**Onboarding:** criar workspace deve retornar URL pública imediatamente. Sistema sugere: "Adicione seu primeiro produto".

**Public Catalog Page:**  `/w/:slug` — mostra lista, filtro por tag, botão "Solicitar Orçamento" que abre modal com formulário pré-preenchido.

**Gerar Orçamento:** cria `quote` com hash, gera PDF via template e permite envio por email/link.

---

## 20. Templates de PR para AI

Titulo: `feat(workspace): add catalog crud + public page`
Body:

* Resumo do que foi feito
* Como testar localmente
* Endpoints adicionados
* Stories e testes

---

## 21. Como a AI deve operar (padrões de comportamento)

1. Sempre gerar um resumo curto antes de codar.
2. Antes de criar um PR, executar testes localmente (simular via scripts).
3. Ao propor UI, gerar storybook e captura visual.
4. A cada alteração de dados persistentes, criar migration e seed.
5. Para decisões arquiteturais, criar um ADR curto.

---

## 22. Recursos úteis & links (placeholder)

* README do repo
* Arquivo de envs `.env.example`
* Scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm e2e`

---

## 23. Próximos passos sugeridos (para tu, eu, Cursor)

* **Tu (Tai):** revisar prioridades do roadmap e aprovar MVP scope.
* **Eu (Zara):** coordenar templates de prompts e revisar PRs críticos.
* **Cursor:** executar tickets do backlog seguindo templates acima (começar pelo onboarding flow).

---

## 24. Observação final (brutal e honesta)

Seumei precisa ser útil rápido: foque em reduzir fricção do usuário MEI. Não invente widgets bonitinhos sem ROI. Segurança e dados do cliente importam; não deixe isso para depois.

---

### FIM — Use este documento como contrato base. Atualize quando decisões mudarem (ADR). Boa.
