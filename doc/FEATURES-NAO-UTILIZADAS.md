# Features Não Utilizadas - Seumei

> **Objetivo**: Documentar todas as features planejadas mas não implementadas ou parcialmente implementadas no sistema Seumei.

---

## 📊 RESUMO EXECUTIVO

### Estatísticas Gerais

- **Total de Modelos no Schema:** 50+
- **Modelos Totalmente Implementados:** 8 (16%)
- **Modelos Parcialmente Implementados:** 15 (30%)
- **Modelos Não Implementados:** 27+ (54%)

### Categorização por Status

| Status | Quantidade | % |
|--------|------------|---|
| ✅ **Implementado Completo** | 8 | 16% |
| ⚠️ **Parcialmente Implementado** | 15 | 30% |
| ❌ **Não Implementado** | 27 | 54% |

---

## 1. FEATURES CORE NÃO IMPLEMENTADAS

### 1.1 Onboarding System

**Modelos:**
- `OnboardingFlow` - Fluxos de onboarding configuráveis
- `OnboardingCompletion` - Progresso do workspace
- `OnboardingTemplate` - Templates por categoria

**Status:** ❌ **0% Implementado**

**O que existe:**
- ✅ Schema completo no banco
- ✅ Modelos Prisma gerados

**O que falta:**
- ❌ Nenhuma página de UI
- ❌ Nenhum componente React
- ❌ Nenhuma lógica de orquestração (services)
- ❌ Nenhum template cadastrado no banco
- ❌ Nenhum flow cadastrado no banco

**Impacto:** 🔴 **CRÍTICO**
- Sem onboarding, usuário não sabe como começar
- UX quebrada após criar workspace
- Não há guia para configuração inicial

**Esforço de Implementação:** 10-12 dias

**Prioridade:** 🔥 **MÁXIMA**

---

### 1.2 Feature System & Marketplace

**Modelos:**
- `Feature` - Catálogo de features disponíveis
- `WorkspaceFeature` - Features ativas no workspace

**Status:** ❌ **5% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `FeatureCategory` (CORE, AI, AUTOMATION, UI, INTEGRATION)
- ✅ Enum `FeatureSource` (PLAN, STORE, PROMOTION, ONBOARDING)

**O que falta:**
- ❌ Nenhuma feature cadastrada no banco
- ❌ Nenhuma lógica de ativação/desativação
- ❌ Nenhuma UI de marketplace
- ❌ Nenhuma verificação de permissão por feature
- ❌ Nenhuma lógica de expiração de trial
- ❌ Nenhuma notificação de expiração

**Impacto:** 🔴 **ALTO**
- Sistema não é "moldável" como planejado
- Não há diferenciação entre planos
- Não há marketplace interno

**Esforço de Implementação:** 8-10 dias

**Prioridade:** 🔥 **ALTA**

---

### 1.3 Theme System & UI Dinâmica

**Modelos:**
- `ThemeUI` - Tema aplicado ao workspace/enterprise
- `ThemePreset` - Presets de temas reutilizáveis
- `ComponentLayout` - Layout customizado por loja

**Status:** ❌ **5% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `ThemeUIType` (SYSTEM, TEMPLATE, CUSTOM)
- ✅ Campos JSON para design tokens (colors, typography, layout)

**O que falta:**
- ❌ Nenhum preset cadastrado no banco
- ❌ Nenhuma lógica de aplicação de tema
- ❌ Nenhuma UI de seleção de tema
- ❌ Nenhuma UI de customização de tema
- ❌ Nenhuma aplicação de design tokens no CSS
- ❌ Nenhuma lógica de dark mode
- ❌ Nenhum layout customizado

**Impacto:** 🔴 **ALTO**
- Todos os workspaces têm a mesma aparência
- Não há diferenciação visual por categoria
- Não há personalização de marca

**Esforço de Implementação:** 10-12 dias

**Prioridade:** 🔥 **ALTA**

---

### 1.4 Wallet & Economia Interna

**Modelos:**
- `Wallet` - Carteira de moedas do workspace
- `WalletTransaction` - Histórico de transações

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `WalletTransactionType` (ONBOARDING_BONUS, PLAN_REWARD, etc.)

**O que falta:**
- ❌ Nenhuma lógica de criação automática de wallet
- ❌ Nenhuma lógica de ganho de moedas (onboarding, planos)
- ❌ Nenhuma lógica de gasto de moedas (features, extensions)
- ❌ Nenhuma UI para visualizar saldo
- ❌ Nenhuma UI para histórico de transações
- ❌ Nenhuma integração com features/marketplace
- ❌ Nenhuma validação de saldo antes de compra

**Impacto:** 🟡 **MÉDIO**
- Marketplace não pode funcionar sem wallet
- Não há incentivo para onboarding
- Não há economia interna

**Esforço de Implementação:** 5-6 dias

**Prioridade:** 🟡 **MÉDIA**

---

## 2. BILLING & SUBSCRIPTION NÃO IMPLEMENTADO

### 2.1 Subscription System

**Modelos:**
- `Subscription` - Assinatura do workspace
- `Plan` - Planos disponíveis (FREE, PRO, ENTERPRISE)

**Status:** ⚠️ **5% Implementado**

**O que existe:**
- ✅ Schema completo com integração Stripe
- ✅ Enum `SubscriptionStatus` (ACTIVE, CANCELED, PAST_DUE, etc.)
- ✅ Enum `BillingCycle` (MONTHLY, YEARLY, LIFETIME)

**O que falta:**
- ❌ Nenhum plano cadastrado no banco
- ❌ Nenhuma lógica de criação de subscription
- ❌ Nenhuma integração com Stripe (checkout)
- ❌ Nenhuma UI de seleção de planos
- ❌ Nenhuma lógica de upgrade/downgrade
- ❌ Nenhuma lógica de cancelamento
- ❌ Nenhuma verificação de limites por plano
- ❌ Nenhum webhook do Stripe

**Impacto:** 🟢 **BAIXO** (para MVP)
- Pode usar plano FREE para todos inicialmente
- Billing pode ser implementado depois

**Esforço de Implementação:** 8-10 dias

**Prioridade:** 🟢 **BAIXA** (pós-MVP)

---

## 3. PERMISSIONS & ROLES NÃO IMPLEMENTADO

### 3.1 Advanced Permissions

**Modelos:**
- `RolePermission` - Permissões customizadas por role
- `ModulePermission` - Permissões por módulo

**Status:** ⚠️ **20% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `WorkspaceRole` (OWNER, ADMIN, MANAGER, OPERATOR, VIEWER)
- ✅ Campo `permissions` (String[]) em `WorkspaceMember`

**O que falta:**
- ❌ Nenhuma lógica de verificação de permissões
- ❌ Nenhuma UI de gerenciamento de roles
- ❌ Nenhuma UI de atribuição de permissões
- ❌ Nenhum middleware de autorização
- ❌ Nenhuma documentação de permissões disponíveis

**Impacto:** 🟡 **MÉDIO**
- Pode usar roles simples (OWNER vs. não-OWNER) no MVP
- Permissões granulares podem vir depois

**Esforço de Implementação:** 6-8 dias

**Prioridade:** 🟡 **MÉDIA** (pós-MVP)

---

## 4. ANALYTICS & AUDIT NÃO IMPLEMENTADO

### 4.1 Analytics System

**Modelos:**
- `AnalyticsEvent` - Eventos rastreados
- `AnalyticsMetric` - Métricas agregadas

**Status:** ❌ **0% Implementado**

**O que existe:**
- ✅ Schema completo

**O que falta:**
- ❌ Nenhum evento sendo rastreado
- ❌ Nenhuma métrica sendo calculada
- ❌ Nenhuma UI de analytics
- ❌ Nenhum dashboard de métricas
- ❌ Nenhuma integração com ferramentas externas (Google Analytics, etc.)

**Impacto:** 🟢 **BAIXO**
- Analytics pode ser implementado depois
- Pode usar ferramentas externas inicialmente

**Esforço de Implementação:** 6-8 dias

**Prioridade:** 🟢 **BAIXA** (pós-MVP)

---

### 4.2 Audit Log System

**Modelo:** `AuditLog`

**Status:** ⚠️ **5% Implementado**

**O que existe:**
- ✅ Schema completo

**O que falta:**
- ❌ Nenhum log sendo criado
- ❌ Nenhuma UI para visualizar logs
- ❌ Nenhuma lógica de retenção de logs
- ❌ Nenhuma exportação de logs

**Impacto:** 🟡 **MÉDIO**
- Importante para compliance (LGPD)
- Pode ser implementado incrementalmente

**Esforço de Implementação:** 4-5 dias

**Prioridade:** 🟡 **MÉDIA**

---

## 5. MÓDULOS DE NEGÓCIO PARCIALMENTE IMPLEMENTADOS

### 5.1 Customers (Clientes)

**Modelo:** `Customer`

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `CustomerStatus` (ACTIVE, INACTIVE, BLOCKED)
- ✅ Enum `CustomerDocumentType` (CPF, CNPJ)

**O que falta:**
- ❌ Nenhuma UI de CRUD
- ❌ Nenhuma integração com pedidos
- ❌ Nenhuma validação de CPF/CNPJ
- ❌ Nenhuma busca/filtro
- ❌ Nenhuma importação/exportação

**Impacto:** 🔴 **ALTO**
- Necessário para criar pedidos
- Necessário para orçamentos

**Esforço de Implementação:** 3-4 dias

**Prioridade:** 🔥 **ALTA**

---

### 5.2 Products (Produtos/Serviços)

**Modelos:** `Product`, `ProductCategory`

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `ProductStatus` (ACTIVE, INACTIVE, ARCHIVED)
- ✅ Suporte a SKU, barcode, estoque

**O que falta:**
- ❌ Nenhuma UI de CRUD
- ❌ Nenhuma integração com catálogo público
- ❌ Nenhum upload de imagens
- ❌ Nenhuma busca/filtro
- ❌ Nenhuma importação/exportação
- ❌ Nenhum controle de estoque

**Impacto:** 🔴 **ALTO**
- Necessário para criar pedidos
- Necessário para catálogo público

**Esforço de Implementação:** 4-5 dias

**Prioridade:** 🔥 **ALTA**

---

### 5.3 Orders (Pedidos)

**Modelos:** `Order`, `OrderItem`

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `OrderStatus` (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
- ✅ Enum `PaymentStatus` (PENDING, PARTIAL, PAID, REFUNDED, FAILED)

**O que falta:**
- ❌ Nenhuma UI de criação
- ❌ Nenhuma UI de listagem
- ❌ Nenhuma integração com pagamentos
- ❌ Nenhuma geração de `orderNumber` sequencial
- ❌ Nenhum cálculo automático de totais
- ❌ Nenhuma impressão/PDF

**Impacto:** 🔴 **ALTO**
- Core do sistema de vendas

**Esforço de Implementação:** 5-6 dias

**Prioridade:** 🔥 **ALTA**

---

### 5.4 Quotes (Orçamentos)

**Modelos:** `Quote`, `QuoteItem`

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `QuoteStatus` (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
- ✅ Campo `convertedToOrderId` para conversão

**O que falta:**
- ❌ Nenhuma UI de criação
- ❌ Nenhuma UI de listagem
- ❌ Nenhuma lógica de conversão para pedido
- ❌ Nenhuma geração de PDF
- ❌ Nenhum envio por email
- ❌ Nenhum link público para visualização

**Impacto:** 🟡 **MÉDIO**
- Útil mas não essencial para MVP

**Esforço de Implementação:** 4-5 dias

**Prioridade:** 🟡 **MÉDIA**

---

### 5.5 Invoices (Notas Fiscais)

**Modelos:** `Invoice`, `InvoiceItem`

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `InvoiceStatus` (DRAFT, ISSUED, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, CANCELED)

**O que falta:**
- ❌ Nenhuma UI de emissão
- ❌ Nenhuma integração fiscal (NFe, NFSe)
- ❌ Nenhuma geração de PDF
- ❌ Nenhum envio por email
- ❌ Nenhum controle de vencimento

**Impacto:** 🟡 **MÉDIO**
- Importante mas pode usar soluções externas inicialmente

**Esforço de Implementação:** 6-8 dias

**Prioridade:** 🟡 **MÉDIA** (pós-MVP)

---

### 5.6 Finance (Financeiro)

**Modelos:** `Transaction`, `BankAccount`, `BankTransaction`

**Status:** ⚠️ **10% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `TransactionType` (INCOME, EXPENSE, TRANSFER, ADJUSTMENT)
- ✅ Enum `TransactionStatus` (PENDING, COMPLETED, FAILED, CANCELED)
- ✅ Enum `BankAccountType` (CHECKING, SAVINGS, DIGITAL)

**O que falta:**
- ❌ Nenhuma UI de transações
- ❌ Nenhuma UI de contas bancárias
- ❌ Nenhuma conciliação bancária
- ❌ Nenhuma importação de OFX
- ❌ Nenhum relatório financeiro
- ❌ Nenhum dashboard de fluxo de caixa

**Impacto:** 🟡 **MÉDIO**
- Importante mas pode vir em fases

**Esforço de Implementação:** 8-10 dias

**Prioridade:** 🟡 **MÉDIA** (pós-MVP)

---

### 5.7 Payments (Pagamentos)

**Modelos:** `PixKey`, `PixPayment`, `DasPayment`, `PaymentLink`, `SplitRule`, `VirtualAccount`

**Status:** ⚠️ **5% Implementado**

**O que existe:**
- ✅ Schema completo
- ✅ Enum `PixKeyType` (RANDOM, EMAIL, PHONE, DOCUMENT)
- ✅ Enum `PixPaymentStatus` (PENDING, PAID, EXPIRED, FAILED)
- ✅ Enum `DasPaymentStatus` (PENDING, PAID, OVERDUE, CANCELED)

**O que falta:**
- ❌ Nenhuma integração com gateway de pagamento
- ❌ Nenhuma UI de pagamentos
- ❌ Nenhuma geração de QR Code PIX
- ❌ Nenhuma verificação de pagamento
- ❌ Nenhuma divisão de pagamentos (split)
- ❌ Nenhum controle de DAS (MEI)

**Impacto:** 🟡 **MÉDIO**
- Importante mas pode usar soluções externas inicialmente

**Esforço de Implementação:** 10-12 dias

**Prioridade:** 🟡 **MÉDIA** (pós-MVP)

---

## 6. FEATURES LEGACY NÃO MIGRADAS

### 6.1 Project Model (Legacy)

**Modelo:** `Project`

**Status:** ⚠️ **Em uso mas deprecated**

**Problema:**
- Sistema ainda usa `Project` ao invés de `Workspace`
- Duplicação de conceitos
- Migração pendente

**O que precisa ser feito:**
- [ ] Migrar todos os `Project` para `Workspace`
- [ ] Atualizar todas as referências no código
- [ ] Remover modelo `Project` do schema
- [ ] Migration script para dados existentes

**Impacto:** 🔴 **ALTO**
- Confusão conceitual
- Código duplicado

**Esforço de Implementação:** 2-3 dias

**Prioridade:** 🔥 **ALTA**

---

## 7. RESUMO POR PRIORIDADE

### 🔥 PRIORIDADE MÁXIMA (Bloqueiam MVP)

1. **Onboarding System** - 10-12 dias
2. **Migração Project → Workspace** - 2-3 dias
3. **Products CRUD** - 4-5 dias
4. **Customers CRUD** - 3-4 dias
5. **Orders Creation** - 5-6 dias

**Total:** ~25-30 dias (5-6 semanas)

---

### 🟡 PRIORIDADE ALTA (Limitam funcionalidade)

1. **Feature System & Marketplace** - 8-10 dias
2. **Theme System** - 10-12 dias
3. **Wallet Integration** - 5-6 dias
4. **Quotes System** - 4-5 dias

**Total:** ~27-33 dias (5-6 semanas)

---

### 🟢 PRIORIDADE MÉDIA (Melhoram UX)

1. **Permissions System** - 6-8 dias
2. **Audit Log** - 4-5 dias
3. **Finance Module** - 8-10 dias
4. **Invoices** - 6-8 dias
5. **Payments** - 10-12 dias

**Total:** ~34-43 dias (7-8 semanas)

---

### 🟢 PRIORIDADE BAIXA (Pós-MVP)

1. **Subscription/Billing** - 8-10 dias
2. **Analytics System** - 6-8 dias

**Total:** ~14-18 dias (3-4 semanas)

---

## 8. RECOMENDAÇÕES

### 8.1 Ações Imediatas

1. **Focar no MVP** - Implementar apenas prioridade máxima
2. **Criar seeds** - Popular banco com dados de exemplo
3. **Documentar decisões** - Manter este documento atualizado
4. **Revisar periodicamente** - Ajustar prioridades conforme necessário

### 8.2 Estratégia de Implementação

1. **Incremental** - Implementar feature por feature
2. **Testável** - Criar testes para cada feature
3. **Documentado** - Atualizar docs a cada feature
4. **Revisado** - Code review antes de merge

### 8.3 Métricas de Sucesso

- **Completude do MVP:** Atingir 80% das features críticas
- **Cobertura de Testes:** Mínimo 70% de cobertura
- **Documentação:** 100% das features documentadas
- **UX:** Onboarding completo e funcional

---

**Documento criado em:** 2026-01-20
**Versão:** 1.0
**Última atualização:** 2026-01-20
