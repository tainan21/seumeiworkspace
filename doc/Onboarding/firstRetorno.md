Thought for 6s# Plano de Arquitetura — Seumei Workspace Onboarding

## Visão Geral da Arquitetura

```plaintext
src/
├── app/
│   ├── onboarding/
│   │   ├── page.tsx                    # Container principal do fluxo
│   │   └── layout.tsx                  # Layout isolado (sem sidebar)
│   └── dashboard/
│       └── page.tsx                    # Dashboard mock pós-criação
├── components/
│   ├── onboarding/
│   │   ├── steps/
│   │   │   ├── intro-step.tsx          # Step 1: Intro + dados empresa
│   │   │   ├── theme-features-step.tsx # Step 2: Tema & Features
│   │   │   ├── company-type-step.tsx   # Step 3: Tipo & Tamanho
│   │   │   ├── template-choice-step.tsx# Step 4: Template ou Custom
│   │   │   ├── custom-builder-step.tsx # Step 5: Construção manual
│   │   │   ├── template-customize-step.tsx # Step 6: Ajustes template
│   │   │   ├── preview-step.tsx        # Step 7: Resumo/Preview
│   │   │   └── create-step.tsx         # Step 8: Criar + Redirect
│   │   ├── primitives/
│   │   │   ├── uploader.tsx
│   │   │   ├── theme-picker.tsx
│   │   │   ├── feature-selector.tsx
│   │   │   ├── template-card.tsx
│   │   │   ├── assembly-animation.tsx
│   │   │   ├── menu-builder.tsx        # DnD para menu
│   │   │   ├── topbar-selector.tsx
│   │   │   └── step-indicator.tsx
│   │   └── preview/
│   │       ├── workspace-preview.tsx
│   │       ├── mock-topbar.tsx
│   │       └── mock-sidebar.tsx
│   └── dashboard/
│       ├── dashboard-shell.tsx
│       └── dashboard-content.tsx
├── domains/
│   ├── workspace/
│   │   ├── workspace.ts                # createWorkspace, assembleMenu
│   │   ├── workspace.types.ts
│   │   └── workspace.rules.ts          # enforceSingleFreeWorkspace
│   ├── company/
│   │   ├── company.ts                  # validateCompanyIdentifier
│   │   └── company.types.ts
│   ├── template/
│   │   ├── template.ts                 # applyTemplateCompatibility
│   │   └── template.types.ts
│   └── rbac/
│       ├── rbac.ts                     # generateRBACDefaults
│       └── rbac.types.ts
├── api/
│   └── mock/
│       └── domains/
│           ├── templates/route.ts
│           ├── validate-id/route.ts
│           ├── workspace/
│           │   └── create/route.ts
│           └── preview/route.ts
├── lib/
│   ├── mock-data/
│   │   ├── templates.ts
│   │   ├── features.ts
│   │   ├── company-types.ts
│   │   ├── components.ts
│   │   └── colors.ts
│   └── stores/
│       └── onboarding-store.ts         # Zustand para estado do fluxo
└── types/
    └── workspace.ts
```

---

## Component List

| Componente | Props | Estados | Eventos
|-----|-----|-----|-----
| `Uploader` | `accept`, `maxSize`, `value`, `onUpload` | `idle`, `uploading`, `success`, `error` | `onFileSelect`, `onUploadComplete`, `onRemove`
| `ThemePicker` | `themes[]`, `selected`, `onChange` | `idle`, `hover`, `selected` | `onSelect`
| `FeatureSelector` | `features[]`, `selected[]`, `max?` | `expanded`, `collapsed` | `onToggle`, `onSelectAll`
| `TemplateCard` | `template`, `isSelected`, `onSelect` | `idle`, `hover`, `selected`, `loading` | `onClick`, `onPreview`
| `AssemblyAnimation` | `items[]`, `variant`, `onComplete` | `idle`, `assembling`, `complete` | `onStart`, `onComplete`
| `MenuBuilder` | `items[]`, `onReorder` | `idle`, `dragging` | `onDrop`, `onRemove`, `onAdd`
| `TopbarSelector` | `variants[]`, `selected`, `onChange` | `idle`, `previewing` | `onSelect`, `onPreview`
| `StepIndicator` | `steps[]`, `current`, `completed[]` | - | `onStepClick`
| `WorkspacePreview` | `config`, `animated?` | `loading`, `ready` | `onRefresh`


---

## Domains Pseudocódigo (TS-like)

### `domains/workspace/workspace.rules.ts`

```typescript
// ============================================
// RULE: enforceSingleFreeWorkspace
// ============================================
type WorkspaceResult = 
  | { allowed: true }
  | { allowed: false; reason: string; suggestion?: string }

function enforceSingleFreeWorkspace(
  userId: string,
  existingWorkspaces: Workspace[],
  userPlan: 'free' | 'pro' | 'enterprise'
): WorkspaceResult {
  // Enterprise pode ter workspaces ilimitados
  if (userPlan === 'enterprise') {
    return { allowed: true }
  }
  
  // Pro pode ter até 3
  if (userPlan === 'pro') {
    const count = existingWorkspaces.filter(w => w.ownerId === userId).length
    if (count >= 3) {
      return { 
        allowed: false, 
        reason: 'LIMIT_REACHED_PRO',
        suggestion: 'Faça upgrade para Enterprise para workspaces ilimitados'
      }
    }
    return { allowed: true }
  }
  
  // Free: apenas 1 workspace
  const hasFreeWorkspace = existingWorkspaces.some(
    w => w.ownerId === userId && w.settings.billingPlan === 'free'
  )
  
  if (hasFreeWorkspace) {
    return { 
      allowed: false, 
      reason: 'FREE_LIMIT_REACHED',
      suggestion: 'Faça upgrade para Pro para criar mais workspaces'
    }
  }
  
  return { allowed: true }
}
```

### `domains/company/company.ts`

```typescript
// ============================================
// RULE: validateCompanyIdentifier
// ============================================
type IdentifierType = 'CNPJ' | 'CPF'
type ValidationResult = 
  | { status: 'valid'; formatted: string }
  | { status: 'invalid'; errors: string[] }
  | { status: 'optional'; message: string }

function validateCompanyIdentifier(
  value: string | null | undefined,
  type: IdentifierType
): ValidationResult {
  // Campo opcional - aceita vazio
  if (!value || value.trim() === '') {
    return { status: 'optional', message: 'Identificador não informado' }
  }
  
  const cleaned = value.replace(/\D/g, '')
  
  if (type === 'CNPJ') {
    return validateCNPJ(cleaned)
  }
  
  return validateCPF(cleaned)
}

function validateCNPJ(cnpj: string): ValidationResult {
  const errors: string[] = []
  
  // Tamanho
  if (cnpj.length !== 14) {
    errors.push('CNPJ deve ter 14 dígitos')
  }
  
  // Sequência repetida
  if (/^(\d)\1+$/.test(cnpj)) {
    errors.push('CNPJ inválido: sequência repetida')
  }
  
  // Checksum (dígitos verificadores)
  if (cnpj.length === 14 && !verifyCNPJChecksum(cnpj)) {
    errors.push('Dígitos verificadores inválidos')
  }
  
  if (errors.length > 0) {
    return { status: 'invalid', errors }
  }
  
  // Formatar: XX.XXX.XXX/XXXX-XX
  const formatted = cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
  
  return { status: 'valid', formatted }
}

function validateCPF(cpf: string): ValidationResult {
  const errors: string[] = []
  
  if (cpf.length !== 11) {
    errors.push('CPF deve ter 11 dígitos')
  }
  
  if (/^(\d)\1+$/.test(cpf)) {
    errors.push('CPF inválido: sequência repetida')
  }
  
  if (cpf.length === 11 && !verifyCPFChecksum(cpf)) {
    errors.push('Dígitos verificadores inválidos')
  }
  
  if (errors.length > 0) {
    return { status: 'invalid', errors }
  }
  
  const formatted = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  
  return { status: 'valid', formatted }
}

// Algoritmo checksum CNPJ
function verifyCNPJChecksum(cnpj: string): boolean {
  const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2]
  const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
  
  const digits = cnpj.split('').map(Number)
  
  const sum1 = weights1.reduce((acc, w, i) => acc + w * digits[i], 0)
  const check1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11)
  
  if (check1 !== digits[12]) return false
  
  const sum2 = weights2.reduce((acc, w, i) => acc + w * digits[i], 0)
  const check2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11)
  
  return check2 === digits[13]
}
```

### `domains/template/template.ts`

```typescript
// ============================================
// RULE: chooseDefaultAppsByCompanyType
// ============================================
type CompanyType = 'MEI' | 'Simples' | 'EIRELI' | 'Ltda' | 'SA' | 'Startup'

const APP_RECOMMENDATIONS: Record<CompanyType, string[]> = {
  'MEI': ['finances', 'clients', 'calendar'],
  'Simples': ['finances', 'clients', 'projects', 'docs'],
  'EIRELI': ['finances', 'clients', 'projects', 'docs', 'people'],
  'Ltda': ['finances', 'clients', 'projects', 'docs', 'people', 'reports'],
  'SA': ['finances', 'clients', 'projects', 'docs', 'people', 'reports', 'compliance', 'analytics'],
  'Startup': ['projects', 'docs', 'people', 'analytics', 'roadmap', 'integrations']
}

function chooseDefaultAppsByCompanyType(
  companyType: CompanyType,
  employeeCount?: number
): { apps: string[]; priority: 'essential' | 'recommended' | 'optional' }[] {
  const baseApps = APP_RECOMMENDATIONS[companyType] || APP_RECOMMENDATIONS['Simples']
  
  // Ajustar baseado no tamanho
  let additionalApps: string[] = []
  
  if (employeeCount && employeeCount > 10) {
    additionalApps.push('people', 'teams')
  }
  if (employeeCount && employeeCount > 50) {
    additionalApps.push('departments', 'workflows')
  }
  
  const essential = baseApps.slice(0, 3)
  const recommended = [...new Set([...baseApps.slice(3), ...additionalApps])]
  
  return [
    { apps: essential, priority: 'essential' },
    { apps: recommended, priority: 'recommended' }
  ]
}

// ============================================
// RULE: applyTemplateCompatibility
// ============================================
type CompatibilityResult = {
  compatible: boolean
  warnings: string[]
  suggestions: string[]
  adjustedFeatures?: string[]
}

function applyTemplateCompatibility(
  template: Template,
  selectedFeatures: string[],
  companyType: CompanyType
): CompatibilityResult {
  const warnings: string[] = []
  const suggestions: string[] = []
  const adjustedFeatures = [...selectedFeatures]
  
  // Verificar features não suportadas pelo template
  const unsupported = selectedFeatures.filter(
    f => !template.supportedFeatures.includes(f)
  )
  
  if (unsupported.length > 0) {
    warnings.push(`Features não suportadas: ${unsupported.join(', ')}`)
    suggestions.push('Considere o template "Custom" para acesso completo')
    
    // Remover features não suportadas
    unsupported.forEach(f => {
      const idx = adjustedFeatures.indexOf(f)
      if (idx > -1) adjustedFeatures.splice(idx, 1)
    })
  }
  
  // Verificar se template é adequado para o tipo de empresa
  if (template.targetCompanyTypes && 
      !template.targetCompanyTypes.includes(companyType)) {
    warnings.push(`Template otimizado para: ${template.targetCompanyTypes.join(', ')}`)
    suggestions.push(`Sugerimos: ${suggestAlternativeTemplate(companyType)}`)
  }
  
  // Verificar features obrigatórias do template
  const requiredMissing = template.requiredFeatures?.filter(
    f => !selectedFeatures.includes(f)
  ) || []
  
  if (requiredMissing.length > 0) {
    warnings.push(`Features obrigatórias serão adicionadas: ${requiredMissing.join(', ')}`)
    adjustedFeatures.push(...requiredMissing)
  }
  
  return {
    compatible: unsupported.length === 0,
    warnings,
    suggestions,
    adjustedFeatures: adjustedFeatures !== selectedFeatures ? adjustedFeatures : undefined
  }
}
```

### `domains/workspace/workspace.ts`

```typescript
// ============================================
// RULE: assembleMenu
// ============================================
type MenuComponent = {
  id: string
  type: 'item' | 'group' | 'divider'
  label?: string
  icon?: string
  children?: MenuComponent[]
}

type MenuItem = {
  id: string
  label: string
  icon: string
  order: number
  parentId?: string
  route: string
}

function assembleMenu(
  componentsSelected: MenuComponent[],
  appsEnabled: string[]
): MenuItem[] {
  const menuItems: MenuItem[] = []
  let order = 0
  
  function processComponent(
    component: MenuComponent, 
    parentId?: string
  ): void {
    // Pular dividers
    if (component.type === 'divider') {
      return
    }
    
    // Verificar se o app está habilitado
    if (component.type === 'item') {
      const appId = component.id.split('-')[0] // ex: 'projects-list' -> 'projects'
      if (!appsEnabled.includes(appId) && !isSystemItem(component.id)) {
        return // Pular itens de apps desabilitados
      }
    }
    
    const menuItem: MenuItem = {
      id: component.id,
      label: component.label || generateLabel(component.id),
      icon: component.icon || getDefaultIcon(component.id),
      order: order++,
      parentId,
      route: generateRoute(component.id)
    }
    
    menuItems.push(menuItem)
    
    // Processar filhos recursivamente
    if (component.children) {
      component.children.forEach(child => 
        processComponent(child, component.id)
      )
    }
  }
  
  componentsSelected.forEach(c => processComponent(c))
  
  return menuItems
}

// ============================================
// RULE: createWorkspace (main orchestrator)
// ============================================
type CreateWorkspaceInput = {
  userId: string
  name: string
  slug?: string
  brand: {
    logo?: string
    colors: { primary: string; accent: string }
  }
  company: {
    name: string
    identifier?: { type: 'CNPJ' | 'CPF'; value: string }
  }
  theme: 'minimal' | 'corporate' | 'playful'
  companyType: CompanyType
  employeeCount?: number
  template?: string
  selectedFeatures: string[]
  menuComponents: MenuComponent[]
  topBarVariant: 'barTop-A' | 'barTop-B' | 'barTop-C'
}

type CreateWorkspaceResult = 
  | { success: true; workspace: Workspace }
  | { success: false; errors: WorkspaceError[] }

async function createWorkspace(
  input: CreateWorkspaceInput,
  context: { existingWorkspaces: Workspace[]; userPlan: string }
): Promise<CreateWorkspaceResult> {
  const errors: WorkspaceError[] = []
  
  // 1. Verificar limite de workspaces
  const limitCheck = enforceSingleFreeWorkspace(
    input.userId,
    context.existingWorkspaces,
    context.userPlan as any
  )
  if (!limitCheck.allowed) {
    errors.push({ 
      code: 'WORKSPACE_LIMIT', 
      message: limitCheck.reason,
      suggestion: limitCheck.suggestion
    })
    return { success: false, errors }
  }
  
  // 2. Validar identifier se fornecido
  if (input.company.identifier?.value) {
    const idValidation = validateCompanyIdentifier(
      input.company.identifier.value,
      input.company.identifier.type
    )
    if (idValidation.status === 'invalid') {
      errors.push({
        code: 'INVALID_IDENTIFIER',
        message: idValidation.errors.join('; ')
      })
    }
  }
  
  // 3. Verificar compatibilidade do template
  if (input.template) {
    const template = await getTemplate(input.template)
    const compat = applyTemplateCompatibility(
      template,
      input.selectedFeatures,
      input.companyType
    )
    if (!compat.compatible) {
      // Não bloqueia, mas ajusta
      input.selectedFeatures = compat.adjustedFeatures || input.selectedFeatures
    }
  }
  
  // 4. Determinar apps baseado no tipo de empresa
  const appRecommendations = chooseDefaultAppsByCompanyType(
    input.companyType,
    input.employeeCount
  )
  const enabledApps = [
    ...appRecommendations.find(r => r.priority === 'essential')!.apps,
    ...input.selectedFeatures
  ]
  
  // 5. Montar menu
  const menuItems = assembleMenu(input.menuComponents, enabledApps)
  
  // 6. Gerar RBAC padrão
  const rbac = generateRBACDefaults({
    ownerId: input.userId,
    apps: enabledApps
  })
  
  // 7. Gerar slug se não fornecido
  const slug = input.slug || generateSlug(input.name)
  
  // 8. Criar workspace
  const workspace: Workspace = {
    workspaceId: generateUUID(),
    slug,
    name: input.name,
    brand: input.brand,
    company: input.company,
    apps: [...new Set(enabledApps)],
    menuItems,
    topBarVariant: input.topBarVariant,
    theme: input.theme,
    ownerId: input.userId,
    settings: {
      billingPlan: context.userPlan === 'free' ? 'free' : 'pro',
      locale: 'pt-BR'
    },
    rbac,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  return { success: true, workspace }
}
```

### `domains/rbac/rbac.ts`

```typescript
// ============================================
// RULE: generateRBACDefaults
// ============================================
type Permission = {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[]
}

type Role = {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isDefault?: boolean
  isSystem?: boolean
}

type RBACConfig = {
  roles: Role[]
  defaultRole: string
}

function generateRBACDefaults(workspace: {
  ownerId: string
  apps: string[]
}): RBACConfig {
  const { apps } = workspace
  
  // Owner: acesso total
  const ownerPermissions: Permission[] = [
    { resource: '*', actions: ['manage'] },
    { resource: 'workspace', actions: ['manage'] },
    { resource: 'billing', actions: ['manage'] },
    { resource: 'members', actions: ['manage'] }
  ]
  
  // Admin: quase tudo, exceto billing e delete workspace
  const adminPermissions: Permission[] = [
    { resource: 'members', actions: ['create', 'read', 'update'] },
    { resource: 'settings', actions: ['read', 'update'] },
    ...apps.map(app => ({
      resource: app,
      actions: ['create', 'read', 'update', 'delete'] as const
    }))
  ]
  
  // Member: CRUD nos apps, sem admin
  const memberPermissions: Permission[] = apps.map(app => ({
    resource: app,
    actions: ['create', 'read', 'update'] as const
  }))
  
  // Guest: somente leitura
  const guestPermissions: Permission[] = apps.map(app => ({
    resource: app,
    actions: ['read'] as const
  }))
  
  const roles: Role[] = [
    {
      id: 'owner',
      name: 'Proprietário',
      description: 'Acesso total ao workspace',
      permissions: ownerPermissions,
      isSystem: true
    },
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Gerencia membros e configurações',
      permissions: adminPermissions,
      isSystem: true
    },
    {
      id: 'member',
      name: 'Membro',
      description: 'Acesso padrão aos apps',
      permissions: memberPermissions,
      isDefault: true,
      isSystem: true
    },
    {
      id: 'guest',
      name: 'Convidado',
      description: 'Acesso somente leitura',
      permissions: guestPermissions,
      isSystem: true
    }
  ]
  
  return {
    roles,
    defaultRole: 'member'
  }
}
```

---

## Mock API Contracts

### `GET /api/mock/domains/templates`

```typescript
// Response 200
{
  "templates": [
    {
      "id": "startup-saas",
      "name": "Startup SaaS",
      "description": "Ideal para startups de tecnologia",
      "thumbnail": "/templates/startup-saas.png",
      "supportedFeatures": ["projects", "docs", "analytics", "integrations"],
      "requiredFeatures": ["projects"],
      "targetCompanyTypes": ["Startup", "Ltda"],
      "topBarVariant": "barTop-B",
      "theme": "minimal",
      "menuPreset": [
        { "id": "dashboard", "label": "Dashboard", "icon": "LayoutDashboard" },
        { "id": "projects", "label": "Projetos", "icon": "FolderKanban" }
      ]
    }
  ]
}
```

### `POST /api/mock/domains/validate-id`

```typescript
// Request
{ "type": "CNPJ" | "CPF", "value": "12345678000195" }

// Response 200 (valid)
{ "valid": true, "formatted": "12.345.678/0001-95", "status": "valid" }

// Response 200 (invalid)
{ "valid": false, "status": "invalid", "errors": ["Dígitos verificadores inválidos"] }

// Response 200 (optional/empty)
{ "valid": true, "status": "optional", "message": "Identificador não informado" }
```

### `POST /api/mock/domains/workspace/create`

```typescript
// Request
{
  "userId": "user-mock-1",
  "name": "Acme Studio",
  "brand": { "logo": "data:...", "colors": { "primary": "#123456", "accent": "#FFAA00" } },
  "company": { "name": "Acme LTDA", "identifier": { "type": "CNPJ", "value": "12.345.678/0001-95" } },
  "theme": "corporate",
  "companyType": "Ltda",
  "employeeCount": 25,
  "template": "startup-saas",
  "selectedFeatures": ["projects", "docs", "people"],
  "menuComponents": [...],
  "topBarVariant": "barTop-A"
}

// Response 200 (success)
{
  "success": true,
  "workspace": { /* full workspace object */ }
}

// Response 200 (error)
{
  "success": false,
  "errors": [
    { "code": "WORKSPACE_LIMIT", "message": "FREE_LIMIT_REACHED", "suggestion": "..." }
  ]
}
```

### `POST /api/mock/domains/preview`

```typescript
// Request
{ "payload": { /* partial workspace config */ } }

// Response 200
{
  "previewJson": { /* workspace preview data */ },
  "menuItems": [...],
  "topBarConfig": { "variant": "barTop-A", "showSearch": true, "showNotifications": true },
  "themeVars": { "--primary": "#123456", "--accent": "#FFAA00" }
}
```

---

## Especificação de Animações

| Animação | Trigger | Duração | Implementação
|-----|-----|-----|-----
| **IntroCards** | Mount de cada card | 500ms stagger 200ms | `motion.div` com `initial={{ opacity: 0, y: 20 }}` `animate={{ opacity: 1, y: 0 }}`
| **AssemblyAnimation** | Seleção de template/custom | 2000ms | `AnimatePresence` + `motion.div` com `layout`. Blocos caem de cima (`y: -100`) e encaixam com `spring`.
| **ReconfigAnimation** | Alteração de cor/módulo | 800ms | `motion.div` com `key={config.hash}` para re-render. Fade + scale.
| **MenuDrag** | Durante drag | Contínuo | `Reorder.Group` do Framer Motion. `whileDrag={{ scale: 1.05, shadow: "lg" }}`
| **StepTransition** | Navegação entre steps | 400ms | `AnimatePresence mode="wait"`. Exit: `x: -50, opacity: 0`. Enter: `x: 50 → 0`.
| **PreviewBuild** | Ao entrar no Step 7 | 1500ms | Sequencial: topbar aparece (300ms) → sidebar (500ms) → content (700ms).
| **SuccessConfetti** | Workspace criado | 3000ms | Canvas particles ou `react-confetti`. Trigger após response 200.


---

## Mock Data (exemplos)

### `lib/mock-data/templates.ts`

```typescript
export const MOCK_TEMPLATES = [
  {
    id: 'startup-saas',
    name: 'Startup SaaS',
    description: 'Para startups de tecnologia e SaaS',
    thumbnail: '/templates/startup-saas.png',
    supportedFeatures: ['projects', 'docs', 'analytics', 'roadmap', 'integrations'],
    requiredFeatures: ['projects'],
    targetCompanyTypes: ['Startup', 'Ltda'],
    topBarVariant: 'barTop-B',
    theme: 'minimal',
    colors: { primary: '#6366F1', accent: '#22D3EE' }
  },
  {
    id: 'agency',
    name: 'Agência Criativa',
    description: 'Gestão de projetos e clientes',
    thumbnail: '/templates/agency.png',
    supportedFeatures: ['projects', 'clients', 'finances', 'calendar', 'docs'],
    requiredFeatures: ['projects', 'clients'],
    targetCompanyTypes: ['Simples', 'EIRELI', 'Ltda'],
    topBarVariant: 'barTop-A',
    theme: 'playful',
    colors: { primary: '#EC4899', accent: '#F59E0B' }
  },
  {
    id: 'corporate',
    name: 'Corporativo',
    description: 'Estrutura completa para empresas',
    thumbnail: '/templates/corporate.png',
    supportedFeatures: ['projects', 'docs', 'people', 'finances', 'reports', 'compliance'],
    requiredFeatures: ['docs', 'people'],
    targetCompanyTypes: ['Ltda', 'SA'],
    topBarVariant: 'barTop-C',
    theme: 'corporate',
    colors: { primary: '#1E40AF', accent: '#059669' }
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    description: 'Simples e direto ao ponto',
    thumbnail: '/templates/freelancer.png',
    supportedFeatures: ['projects', 'clients', 'finances', 'calendar'],
    requiredFeatures: ['finances'],
    targetCompanyTypes: ['MEI'],
    topBarVariant: 'barTop-A',
    theme: 'minimal',
    colors: { primary: '#10B981', accent: '#8B5CF6' }
  }
]
```

### `lib/mock-data/features.ts`

```typescript
export const MOCK_FEATURES = [
  { id: 'projects', name: 'Projetos', icon: 'FolderKanban', description: 'Kanban, listas e gestão de tarefas' },
  { id: 'docs', name: 'Documentos', icon: 'FileText', description: 'Wiki e base de conhecimento' },
  { id: 'people', name: 'Pessoas', icon: 'Users', description: 'RH e gestão de equipes' },
  { id: 'finances', name: 'Financeiro', icon: 'DollarSign', description: 'Contas, fluxo de caixa' },
  { id: 'clients', name: 'Clientes', icon: 'Building2', description: 'CRM e relacionamento' },
  { id: 'calendar', name: 'Agenda', icon: 'Calendar', description: 'Eventos e compromissos' },
  { id: 'analytics', name: 'Analytics', icon: 'BarChart3', description: 'Dashboards e métricas' },
  { id: 'reports', name: 'Relatórios', icon: 'FileBarChart', description: 'Relatórios customizados' },
  { id: 'integrations', name: 'Integrações', icon: 'Puzzle', description: 'Conecte apps externos' },
  { id: 'roadmap', name: 'Roadmap', icon: 'Map', description: 'Planejamento de produto' }
]
```

### Final `workspacePayload.json`(exemplo completo)

```json
{
  "workspaceId": "ws_mock_7f3k9x2m",
  "slug": "acme-studio",
  "name": "Acme Studio",
  "brand": {
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "colors": {
      "primary": "#2563EB",
      "accent": "#F59E0B"
    }
  },
  "company": {
    "name": "Acme Tecnologia LTDA",
    "identifier": {
      "type": "CNPJ",
      "value": "12.345.678/0001-95"
    }
  },
  "apps": ["projects", "docs", "people", "finances", "analytics"],
  "menuItems": [
    { "id": "dashboard", "label": "Dashboard", "icon": "LayoutDashboard", "order": 0, "route": "/dashboard" },
    { "id": "projects", "label": "Projetos", "icon": "FolderKanban", "order": 1, "route": "/projects" },
    { "id": "docs", "label": "Documentos", "icon": "FileText", "order": 2, "route": "/docs" },
    { "id": "people", "label": "Pessoas", "icon": "Users", "order": 3, "route": "/people" },
    { "id": "finances", "label": "Financeiro", "icon": "DollarSign", "order": 4, "route": "/finances" },
    { "id": "analytics", "label": "Analytics", "icon": "BarChart3", "order": 5, "route": "/analytics" },
    { "id": "settings", "label": "Configurações", "icon": "Settings", "order": 99, "route": "/settings" }
  ],
  "topBarVariant": "barTop-A",
  "theme": "corporate",
  "ownerId": "user_mock_1",
  "settings": {
    "billingPlan": "free",
    "locale": "pt-BR",
    "timezone": "America/Sao_Paulo"
  },
  "rbac": {
    "roles": [
      {
        "id": "owner",
        "name": "Proprietário",
        "permissions": [{ "resource": "*", "actions": ["manage"] }]
      },
      {
        "id": "admin",
        "name": "Administrador",
        "permissions": [{ "resource": "members", "actions": ["create", "read", "update"] }]
      },
      {
        "id": "member",
        "name": "Membro",
        "permissions": [{ "resource": "projects", "actions": ["create", "read", "update"] }]
      },
      {
        "id": "guest",
        "name": "Convidado",
        "permissions": [{ "resource": "projects", "actions": ["read"] }]
      }
    ],
    "defaultRole": "member"
  },
  "createdAt": "2026-01-06T10:30:00.000Z",
  "updatedAt": "2026-01-06T10:30:00.000Z"
}
```

---

## Acceptance Criteria por Etapa

| Step | Critérios
|-----|-----|-----|-----
| **1. Intro** | ✓ 3 cards exibidos em sequência com animação ✓ Upload de logo funcional (mock) ✓ Nome da empresa obrigatório ✓ CNPJ/CPF validação real (checksum) ✓ Botão avançar só ativa com `name` preenchido
| **2. Tema & Features** | ✓ 3 temas clicáveis com preview visual ✓ Features com checkboxes e contador ✓ Mínimo 1 feature selecionada para avançar ✓ Persistência no store
| **3. Tipo & Tamanho** | ✓ Select com tipos de empresa ✓ Slider funcionários (1-500+) ✓ Faixa faturamento opcional ✓ Valores alimentam `chooseDefaultAppsByCompanyType`
| **4. Template/Custom** | ✓ 2 cards grandes clicáveis ✓ Assembly animation dispara ao selecionar ✓ Animação completa antes de avançar ✓ Roteamento condicional (step 5 ou 6)
| **5. Custom Builder** | ✓ 10 tipos de sistema listados ✓ Paletas de cores selecionáveis ✓ TopBar A/B/C com preview ✓ DnD menu funcional ✓ `assembleMenu()` gera output correto
| **6. Template Customize** | ✓ Cores editáveis ✓ Menu reordenável ✓ Módulos add/remove ✓ Animação de reconfiguração
| **7. Preview** | ✓ JSON completo exibido ✓ Preview visual (topbar + sidebar) ✓ Botão "Confirmar" ativo ✓ Valida `applyTemplateCompatibility`
| **8. Create + Redirect** | ✓ POST mock executado ✓ `enforceSingleFreeWorkspace` validado ✓ `generateRBACDefaults` aplicado ✓ Redirect para dashboard ✓ Dashboard reflete seleções


---

## Fluxograma de Decisão

```plaintext
[Start]
    │
    ▼
[Step 1: Intro] ──────────────────────────────────────┐
    │                                                  │
    ▼                                                  │
[Step 2: Theme & Features]                             │
    │                                                  │
    ▼                                                  │
[Step 3: Company Type & Size]                          │
    │                                                  │
    ▼                                                  │
[Step 4: Template or Custom?]                          │
    │                                                  │
    ├──── Template ────┐       ┌──── Custom ────┤     │
    │                  │       │                │     │
    ▼                  │       │                ▼     │
[Step 6: Quick         │       │    [Step 5: Builder] │
 Customization]        │       │                │     │
    │                  │       │                │     │
    └──────────────────┴───────┴────────────────┘     │
                       │                              │
                       ▼                              │
               [Step 7: Preview]                      │
                       │                              │
                       ▼                              │
               [Step 8: Create]                       │
                       │                              │
                       ▼                              │
               [Dashboard] ◄──────────────────────────┘
```

---

## Próximos Passos

**Aguardando sua aprovação para iniciar a implementação.** O plano inclui:

1. **Fase 1**: Store (Zustand) + Types + Mock Data
2. **Fase 2**: Domains (todas as funções acima, testáveis)
3. **Fase 3**: API Routes (mock endpoints)
4. **Fase 4**: Components primitivos (Uploader, ThemePicker, etc.)
5. **Fase 5**: Steps (8 páginas do fluxo)
6. **Fase 6**: Animações (Framer Motion)
7. **Fase 7**: Dashboard mock final


**Posso prosseguir com a implementação?**