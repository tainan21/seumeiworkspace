Analisando os documentos e o modelo mental de domains. Propondo melhorias:


[2 tools called]


Análise e proposta de melhoria baseada no modelo mental de domains:

## Análise crítica e melhorias necessárias

### Pontos fortes já implementados
1. Workspace como tenant principal — ok
2. Enterprise como contexto opcional — ok
3. Wallet isolado — ok
4. Features desacopladas de planos — ok

### Problemas identificados e correções

```markdown
# 🏗️ ARQUITETURA POR DOMAINS - SEUMEI V1
# Análise e Melhorias Baseadas no Modelo Mental

## 1. PROBLEMA: Billing acoplado ao Workspace

### ❌ Situação Atual:
- Workspace tem campos Stripe diretos
- Features podem depender de billing sem abstração

### ✅ Solução: Domain `billing` isolado

```
/domains
  /billing
    /stripe       ← Gateway isolado
    /plans        ← Planos
    /subscriptions ← Assinaturas
```

**Regra de Ouro**: Feature nunca conhece Stripe direto. Usa abstração de billing.

## 2. PROBLEMA: Analytics domain faltando

### ❌ Situação Atual:
- Sem domain dedicado para analytics
- Dados espalhados

### ✅ Solução: Domain `analytics`

```
/domains
  /analytics
    /events       ← Eventos de tracking
    /reports      ← Relatórios gerados
    /metrics      ← Métricas agregadas
```

## 3. PROBLEMA: Templates domain confuso

### ❌ Situação Atual:
- ThemePresets existe mas não está claro
- Templates de onboarding misturados

### ✅ Solução: Domain `templates` organizado

```
/domains
  /templates
    /theme        ← ThemePresets
    /onboarding   ← Templates de onboarding
    /message      ← MessageTemplates (já existe)
```

## 4. PROBLEMA: Onboarding como processo, não domain

### ❌ Situação Atual:
- Onboarding mencionado mas não modelado
- Fluxo não está documentado no schema

### ✅ Solução: Domain `onboarding`

```
/domains
  /onboarding
    /flows        ← Fluxos de onboarding
    /steps        ← Passos do usuário
    /completions  ← Progresso do usuário
```

## 5. PROBLEMA: Permissions espalhadas

### ❌ Situação Atual:
- RolePermission, ModulePermission, WorkspaceRole misturados
- Sem domain claro

### ✅ Solução: Domain `permissions` centralizado

```
/domains
  /permissions
    /roles        ← Roles e permissões
    /policies     ← Políticas de acesso
    /grants       ← Grants específicos
```

## 6. PROBLEMA: Audit domain não explícito

### ❌ Situação Atual:
- AuditLog existe mas não está claro que é um domain
- Sem patterns de auditoria documentados

### ✅ Solução: Domain `audit` explícito

```
/domains
  /audit
    /logs         ← AuditLogs
    /events       ← Eventos auditáveis
    /compliance   ← Dados de compliance
```

## PROPOSTA DE ESTRUTURA DE DOMAINS COMPLETA

```
/domains
  /auth              ✅ (já existe - Session, EmailVerificationCode)
    - Autenticação pura
    - Não conhece workspace

  /user              ✅ (já existe - User)
    - Identidade pura
    - Não tem plano, wallet, dados de negócio

  /workspace         ✅ (já existe - Workspace, WorkspaceMember)
    - Core absoluto
    - Container de tudo

  /enterprise        ✅ (já existe - Enterprise)
    - Empresa mãe + lojas
    - Contexto opcional por workspace

  /theme-ui          ✅ (já existe - ThemeUI, ThemePreset, ComponentLayout)
    - Layout e design
    - Componentes configuráveis

  /features          ✅ (já existe - Feature, WorkspaceFeature, Extension)
    - Apps e extensões
    - Marketplace interno

  /wallet            ✅ (já existe - Wallet, WalletTransaction)
    - Moedas e créditos
    - Economia interna

  /billing           ⚠️ (PARCIAL - precisa isolamento)
    /stripe          ← Gateway isolado
    /plans           ← Plan (existe mas precisa mover)
    /subscriptions   ← Lógica de assinatura

  /analytics         ❌ (FALTANDO)
    /events
    /reports
    /metrics

  /templates         ⚠️ (PARCIAL - precisa organização)
    /theme           ← ThemePreset
    /onboarding      ← Templates de onboarding
    /message         ← MessageTemplate

  /onboarding        ❌ (FALTANDO - precisa modelagem)
    /flows
    /steps
    /completions

  /permissions       ⚠️ (PARCIAL - precisa centralização)
    /roles           ← RolePermission, WorkspaceRole
    /policies        ← DunningPolicy, ModulePermission
    /grants          ← Grants específicos

  /audit             ⚠️ (PARCIAL - precisa explícito)
    /logs            ← AuditLog
    /events
    /compliance
```

## MELHORIAS ESPECÍFICAS NO SCHEMA

### 1. Separar Billing do Workspace

```prisma
// Domain: billing
model Subscription {
  id            String   @id @default(cuid())
  workspaceId   String   @unique @map(name: "workspace_id")
  
  planId        String   @map(name: "plan_id")
  plan          Plan     @relation(fields: [planId], references: [id])
  
  // Status
  status        SubscriptionStatus @default(ACTIVE)
  
  // Período
  currentPeriodStart DateTime @map(name: "current_period_start")
  currentPeriodEnd   DateTime @map(name: "current_period_end")
  
  // Stripe (isolado aqui, não no Workspace)
  stripeCustomerId     String? @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId String? @unique @map(name: "stripe_subscription_id")
  stripePriceId        String? @map(name: "stripe_price_id")
  
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "subscriptions")
  @@index([workspaceId])
  @@index([status])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
  TRIALING
}

// Workspace referencia Subscription (1:1)
model Workspace {
  // ... campos existentes ...
  // REMOVER campos Stripe daqui
  subscription Subscription?
}
```

### 2. Adicionar Domain Analytics

```prisma
// Domain: analytics
model AnalyticsEvent {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  userId      String?  @map(name: "user_id")
  
  eventType   String   @map(name: "event_type")
  entityType  String?  @map(name: "entity_type")
  entityId    String?  @map(name: "entity_id")
  
  properties  Json     @default("{}")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "analytics_events")
  @@index([workspaceId])
  @@index([eventType])
  @@index([createdAt])
}

model AnalyticsMetric {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  
  metricType  String   @map(name: "metric_type")
  period      String   // "day", "week", "month"
  periodDate  DateTime @map(name: "period_date")
  
  value       Decimal  @db.Decimal(15, 2)
  metadata    Json?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@unique([workspaceId, metricType, period, periodDate])
  @@map(name: "analytics_metrics")
  @@index([workspaceId])
  @@index([metricType])
  @@index([periodDate])
}
```

### 3. Adicionar Domain Onboarding

```prisma
// Domain: onboarding
model OnboardingFlow {
  id          String   @id @default(cuid())
  code        String   @unique // Ex: "DEFAULT", "FRANCHISE", "DELIVERY"
  name        String
  description String?
  
  steps       Json     // Array de steps
  isActive    Boolean  @default(true) @map(name: "is_active")
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "onboarding_flows")
  @@index([code])
}

model OnboardingCompletion {
  id          String   @id @default(cuid())
  workspaceId String   @unique @map(name: "workspace_id")
  flowId      String   @map(name: "flow_id")
  
  currentStep Int      @default(0) @map(name: "current_step")
  completedSteps Json  @default("[]") @map(name: "completed_steps")
  
  isCompleted Boolean  @default(false) @map(name: "is_completed")
  completedAt DateTime? @map(name: "completed_at")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  flow        OnboardingFlow @relation(fields: [flowId], references: [id])
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "onboarding_completions")
  @@index([workspaceId])
  @@index([isCompleted])
}
```

### 4. Organizar Domain Templates

```prisma
// Domain: templates (reorganizar)
// ThemePreset já existe, apenas documentar que está aqui

model OnboardingTemplate {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  category    WorkspaceCategory?
  
  steps       Json     // Template de steps
  config      Json     @default("{}")
  
  isActive    Boolean  @default(true) @map(name: "is_active")
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "onboarding_templates")
  @@index([code])
  @@index([category])
}
```

## PADRÕES DE IMPLEMENTAÇÃO POR DOMAIN

### Regras de Ouro

1. Domain Isolation
```typescript
// ✅ CORRETO - Domain isolado
// domains/billing/service.ts
export class BillingService {
  async createSubscription(workspaceId: string, planId: string) {
    // Lógica de billing isolada
    // Pode usar Stripe aqui, mas features não conhecem
  }
}

// ❌ ERRADO - Feature conhece Stripe
// domains/features/service.ts
export class FeatureService {
  async enableFeature(workspaceId: string) {
    const stripe = new Stripe(...) // ❌ NÃO!
  }
}

// ✅ CORRETO - Feature usa abstração
export class FeatureService {
  async enableFeature(workspaceId: string) {
    const billing = new BillingService()
    const canEnable = await billing.checkFeatureAccess(workspaceId, 'FEATURE_X')
  }
}
```

2. UI nunca decide regra
```typescript
// ❌ ERRADO - UI decide
if (user.plan === 'PRO') {
  showFeature()
}

// ✅ CORRETO - Service decide
const canAccess = await featureService.canAccessFeature(workspaceId, 'FEATURE_X')
if (canAccess) {
  showFeature()
}
```

3. Workspace como contexto obrigatório
```typescript
// ✅ SEMPRE passar workspaceId
async function getOrders(workspaceId: string, filters: OrderFilters) {
  return prisma.order.findMany({
    where: {
      workspaceId, // OBRIGATÓRIO
      ...filters
    }
  })
}
```

## ESTRUTURA DE PASTAS PROPOSTA

```
/src
  /domains
    /auth
      /models
      /services
      /repositories
      
    /user
      /models
      /services
      
    /workspace
      /models
      /services
      /repositories
      
    /enterprise
      /models
      /services
      
    /theme-ui
      /models
      /services
      
    /features
      /models
      /services
      /store      ← Marketplace
      
    /wallet
      /models
      /services
      
    /billing
      /models
      /services
      /stripe     ← Gateway isolado
      
    /analytics
      /models
      /services
      /reports
      
    /templates
      /theme
      /onboarding
      /message
      
    /onboarding
      /models
      /services
      /flows
      
    /permissions
      /models
      /services
      /policies
      
    /audit
      /models
      /services
      /compliance
```

## CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Isolamento de Billing
- [ ] Criar model Subscription
- [ ] Mover campos Stripe do Workspace para Subscription
- [ ] Criar BillingService com abstração
- [ ] Features usam BillingService, não Stripe direto

### Fase 2: Analytics Domain
- [ ] Criar models AnalyticsEvent, AnalyticsMetric
- [ ] Criar AnalyticsService
- [ ] Implementar tracking de eventos principais

### Fase 3: Onboarding Domain
- [ ] Criar models OnboardingFlow, OnboardingCompletion
- [ ] Criar OnboardingService
- [ ] Integrar com fluxo de criação de workspace

### Fase 4: Organização de Templates
- [ ] Organizar ThemePreset no domain templates
- [ ] Criar OnboardingTemplate
- [ ] Documentar MessageTemplate no domain correto

### Fase 5: Permissions Centralizado
- [ ] Organizar todos os models de permissions
- [ ] Criar PermissionService centralizado
- [ ] Documentar patterns de permissões

### Fase 6: Audit Explícito
- [ ] Documentar AuditLog como domain
- [ ] Criar AuditService
- [ ] Padronizar eventos auditáveis

## CONCLUSÃO

O schema atual está 80% alinhado com o modelo mental de domains. As principais melhorias são:

1. Isolar billing completamente (Subscription model)
2. Adicionar domain Analytics
3. Adicionar domain Onboarding
4. Organizar melhor Templates
5. Centralizar Permissions
6. Documentar Audit como domain

Quer que eu crie os models específicos faltantes ou detalhe alguma parte específica?
```

Posso detalhar alguma parte específica ou criar os models completos para os domains faltantes?