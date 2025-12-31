Documentação complementar — Multitenancy
# 🏗️ ARQUITETURA MULTITENANT - SEUMEI V1## Conceitos Fundamentais### 1. Tenant = Workspace- Cada Workspace é um tenant isolado- Workspace contém múltiplas Enterprises (lojas/unidades)- Workspace possui plano, wallet, features próprios### 2. Isolamento de Dados- Todas as queries devem incluir `workspaceId` no WHERE- WorkspaceMember controla acesso de usuários- EnterpriseMother permite múltiplas lojas por workspace### 3. Hierarquia de Dados
Workspace (tenant principal)
├── EnterpriseMother (empresa mãe)
├── Enterprise[] (lojas/unidades)
├── WorkspaceMember[] (usuários)
├── WorkspaceFeature[] (features ativas)
├── ComponentLayout[] (UI por loja)
├── ThemeUI[] (tema por loja)
└── Wallet (economia interna)
## Padrões de Consulta Multitenant### Segurança em Queries// ✅ CORRETO - sempre filtrar por workspaceconst projects = await prisma.project.findMany({  where: {    workspaceId: currentWorkspaceId,    // outros filtros...  }});// ❌ ERRADO - falta filtro de workspaceconst projects = await prisma.project.findMany(); // vaza dados!### Middleware de Tenantscript// Sempre validar workspaceId no contextoexport async function getWorkspaceContext(workspaceId: string, userId: string) {  const membership = await prisma.workspaceMember.findUnique({    where: {      workspaceId_userId: {        workspaceId,        userId      },      isActive: true    }  });    if (!membership) {    throw new Error("Unauthorized workspace access");  }    return membership;}## Onboarding Flow1. User cria conta (FREE)2. Workspace é criado automaticamente3. EnterpriseMother é criada (com formulário)4. User escolhe categoria/template5. ThemeUI é aplicado baseado no template6. Features de trial são ativadas (7 dias)7. Wallet recebe moedas iniciais (onboarding)## Marketplace Interno- Extensions podem ser compradas com moedas- Features podem ser ativadas por plano ou compra- WorkspaceFeature rastreia origem (PLAN | STORE | PROMOTION)- Trials expiram em expiresAt## UI Dinâmica por Loja- ComponentLayout permite customizar telas por Enterprise- ThemeUI permite tema diferente por loja- Componentes podem ter permissions específicas- LayoutVersion permite versionamento de layouts
Middleware de Tenant
// Sempre validar workspaceId no contextoexport async function getWorkspaceContext(workspaceId: string, userId: string) {  const membership = await prisma.workspaceMember.findUnique({    where: {      workspaceId_userId: {        workspaceId,        userId      },      isActive: true    }  });    if (!membership) {    throw new Error("Unauthorized workspace access");  }    return membership;}
Onboarding Flow
User cria conta (FREE)
Workspace é criado automaticamente
EnterpriseMother é criada (com formulário)
User escolhe categoria/template
ThemeUI é aplicado baseado no template
Features de trial são ativadas (7 dias)
Wallet recebe moedas iniciais (onboarding)
Marketplace Interno
Extensions podem ser compradas com moedas
Features podem ser ativadas por plano ou compra
WorkspaceFeature rastreia origem (PLAN | STORE | PROMOTION)
Trials expiram em expiresAt
UI Dinâmica por Loja
ComponentLayout permite customizar telas por Enterprise
ThemeUI permite tema diferente por loja
Componentes podem ter permissions específicas
LayoutVersion permite versionamento de layouts
Esse schema implementa:- Multitenancy completo com Workspace como tenant- Marketplace interno (Extensions)- Sistema de moedas (Wallet)- UI dinâmica (ComponentLayout, ThemeUI)- Features desacopladas de planos- Suporte a franquias (múltiplas Enterprises)- Billing no Workspace (não no User)

# 🏗️ ARQUITETURA MULTITENANT - SEUMEI V1

## Módulos de Negócio

### 📦 Gestão de Vendas
- **Orders**: Pedidos de venda
- **Quotes**: Orçamentos (conversíveis em pedidos)
- **Customers**: Cliente cadastrados
- **Products**: Catálogo de produtos
- **ProductCategories**: Categorização de produtos

### 💰 Gestão Financeira
- **Invoices**: Faturas/Notas fiscais
- **Transactions**: Transações financeiras (receitas/despesas)
- **BankAccounts**: Contas bancárias cadastradas
- **BankTransactions**: Transações bancárias importadas

### 💳 Pagamentos
- **PixPayments**: Pagamentos via PIX
- **PixKeys**: Chaves PIX cadastradas
- **DasPayments**: Pagamentos DAS (para MEI)
- **PaymentLinks**: Links de pagamento
- **SplitRules**: Regras de divisão de pagamento
- **SplitAllocations**: Alocações de divisão

### 👤 MEI e Perfis
- **MeiProfiles**: Perfis de Microempreendedor Individual

### ⚙️ Sistema e Configurações
- **Modules**: Módulos do sistema
- **ModuleConfigs**: Configurações por módulo
- **ModulePermissions**: Permissões por módulo
- **Plans**: Planos de assinatura
- **FeatureFlagOverrides**: Overrides de feature flags
- **ThemePresets**: Presets de temas
- **UserDashboardSettings**: Configurações de dashboard por usuário

### 🔔 Notificações e Comunicação
- **Avisos**: Avisos e alertas do sistema
- **MessageTemplates**: Templates de mensagens

### 🔍 Auditoria e Compliance
- **AuditLogs**: Logs de auditoria de ações
- **DunningPolicies**: Políticas de cobrança
- **DunningJobs**: Jobs de cobrança agendados
- **DunningLogs**: Logs de tentativas de cobrança

### 🔗 Integrações e Automações
- **PipelineEvents**: Eventos de pipeline/automação
- **VirtualAccounts**: Contas virtuais para recebimentos

### 👥 Workspace Management
- **WorkspaceInvites**: Convites para workspace
- **WorkspaceRoles**: Roles customizadas por workspace
- **WorkspacePermissions**: Permissões customizadas
- **GlobalUsers**: Usuários globais (cross-workspace)

## Padrões de Isolamento Multitenant

### Todas as tabelas de negócio incluem:
- `workspaceId` - obrigatório (exceto GlobalUsers)
- `enterpriseId` - opcional (quando aplicável a loja específica)

### Queries Seguras:
// ✅ SEMPRE filtrar por workspace
const orders = await prisma.order.findMany({
  where: {
    workspaceId: currentWorkspace.id,
    enterpriseId: currentEnterprise?.id, // opcional
  }
});

// ✅ Validação de acesso
const hasAccess = await prisma.workspaceMember.findUnique({
  where: {
    workspaceId_userId: {
      workspaceId: workspaceId,
      userId: userId
    },
    isActive: true
  }
});## Workflow de Negócio

### Fluxo de Venda:
1. **Quote** (Orçamento) → Cliente aprova
2. **Quote.convertedToOrderId** → Cria **Order**
3. **Order** → Gera **Invoice** (fatura)
4. **Invoice** → Gera **Transaction** (pagamento)
5. **Transaction** → Atualiza saldo

### Gestão de Pagamentos:
- **PIX**: PixKey + PixPayment (QR Code)
- **DAS**: DasPayment (para MEI)
- **Split**: SplitRules + SplitAllocations (divisão entre recebedores)
- **Bank**: BankAccount + BankTransaction (conciliação bancária)

# Continuação da Documentação

## Módulos Adicionais Implementados

### 🔔 Notificações e Comunicação
- **Avisos**: Sistema de alertas e notificações (workspace ou usuário específico)
- **MessageTemplates**: Templates reutilizáveis para emails, SMS, WhatsApp

### 💳 Divisão de Pagamentos
- **SplitRules**: Regras de divisão de pagamentos
- **SplitAllocations**: Alocações específicas (porcentagem ou valor fixo)

### ⚙️ Sistema Modular
- **Modules**: Módulos do sistema (Sales, Inventory, Finance, etc)
- **ModuleConfigs**: Configurações por módulo e workspace
- **ModulePermissions**: Permissões granulares por módulo

### 🔐 Permissões Avançadas
- **RolePermissions**: Roles customizadas por workspace
- **ModulePermissions**: Permissões por módulo e role

### 💰 Gestão de Pagamentos Avançada
- **PaymentLinks**: Links de pagamento compartilháveis
- **VirtualAccounts**: Contas virtuais para recebimentos automatizados

### 📋 Planos
- **Plans**: Planos de assinatura configuráveis
- Integração com Stripe via `stripePriceId`

### 👤 MEI
- **MeiProfiles**: Perfis completos de Microempreendedor Individual
- Vinculado a Enterprise

### 🔄 Automações
- **PipelineEvents**: Sistema de eventos para automações e workflows
- Status: PENDING → PROCESSING → COMPLETED/FAILED

### 🔍 Auditoria
- **AuditLogs**: Logs completos de todas as ações do sistema
- Rastreamento de mudanças, IP, User Agent

### 🎨 Temas
- **ThemePresets**: Presets de temas pré-configurados
- Suporte a temas premium (requer plano PRO+)

### 👥 Gestão de Workspace
- **WorkspaceInvites**: Sistema de convites com tokens e expiração
- **UserDashboardSettings**: Configurações personalizadas de dashboard por usuário/workspace

### 🚩 Feature Flags
- **FeatureFlagOverrides**: Overrides de features por workspace
- Útil para testes, rollouts graduais, etc

### 🔄 Cobrança (Dunning)
- **DunningPolicies**: Políticas de cobrança configuráveis
- **DunningJobs**: Jobs agendados de cobrança
- **DunningLogs**: Logs de tentativas de cobrança
- Suporte a múltiplos canais (Email, SMS, WhatsApp)

### 🌐 Usuários Globais
- **GlobalUsers**: Usuários com permissões cross-workspace
- Útil para administradores do sistema

## Padrões de Relacionamento

### Relacionamentos Obrigatórios
- Todos os modelos de negócio → `workspaceId` (obrigatório, exceto GlobalUser)
- Muitos modelos → `enterpriseId` (opcional, quando aplicável)

### Relacionamentos Opcionais por Contexto
- `userId` em Avisos (null = aviso para workspace inteiro)
- `workspaceId` em AuditLogs (null = ação global do sistema)
- `workspaceId` em FeatureFlagOverrides (null = override global)

## Índices Importantes

Todas as tabelas têm índices estratégicos para:
- `workspaceId` (isolamento multitenant)
- `enterpriseId` (filtros por loja)
- Campos únicos (`code`, `email`, `document`, etc)
- Status fields (para queries de filtro rápido)
- Datas (para ordenação e filtros temporais)

## Migrações Recomendadas

1. **Workspace como tenant principal** - Tudo deve estar isolado por workspace
2. **Enterprise como contexto** - Opcional mas importante para franquias
3. **AuditLogs para compliance** - Implementar logging desde o início
4. **Modules para escalabilidade** - Sistema modular permite evolução