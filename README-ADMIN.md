# 🛡️ Domain Admin - Visualização Global

Este documento explica como usar o sistema de administração global da SEUMEI.

## 📋 Visão Geral

O domain `admin` permite que usuários com role `GlobalUser.role = ADMIN` visualizem e gerenciem **TODOS** os workspaces do sistema, sem restrições de workspaceId.

## 🔐 Autenticação

### Criar um Admin

Para tornar um usuário admin, você precisa criar um registro na tabela `GlobalUser`:

```sql
-- Exemplo: Tornar um usuário admin
INSERT INTO global_users (id, "userId", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'cuid_gerado',
  'user_id_aqui',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

Ou via Prisma:

```typescript
import { prisma } from '~/lib/server/db'

await prisma.globalUser.create({
  data: {
    userId: 'user_id_aqui',
    role: 'ADMIN',
    isActive: true,
  },
})
```

### Roles Disponíveis

- `ADMIN`: Acesso completo (visualização e gerenciamento)
- `SUPPORT`: Acesso de suporte (visualização limitada)
- `BILLING`: Acesso de billing (apenas dados financeiros)

## 📁 Estrutura

```
src/domains/admin/
├── types.ts              # Tipos TypeScript
├── services/
│   └── admin.service.ts  # Lógica de negócio
├── actions/
│   └── admin.actions.ts  # Server Actions
├── middleware/
│   └── admin.middleware.ts  # Validação de acesso
└── index.ts              # Exports
```

## 🎯 Funcionalidades

### 1. Visualização Global

```typescript
import { AdminService } from '~/domains/admin'

const adminService = new AdminService()

// Lista TODOS os workspaces (sem filtro de workspaceId)
const workspaces = await adminService.listAllWorkspaces({
  status: 'ACTIVE',
  limit: 50,
  page: 0,
})

// Estatísticas globais
const stats = await adminService.getGlobalStats()
```

### 2. Detalhes de Workspace

```typescript
// Acessa qualquer workspace (sem validação de ownership)
const workspace = await adminService.getWorkspaceDetails('workspace_id')
```

### 3. Validação de Admin

```typescript
import { requireAdmin } from '~/domains/admin'

// Em Server Components
const userId = await requireAdmin() // throw se não for admin

// Em Server Actions
import { checkIsAdminAction } from '~/domains/admin'
const isAdmin = await checkIsAdminAction()
```

## 🌐 Rotas

### `/admin`

Dashboard administrativo principal com:
- Estatísticas globais
- Lista de todos os workspaces
- Filtros e busca

### Proteção de Rotas

Para proteger uma rota admin:

```typescript
// app/admin/page.tsx
import { requireAdmin } from '~/domains/admin/middleware/admin.middleware'

export default async function AdminPage() {
  await requireAdmin() // Redireciona se não for admin
  
  // ... resto do código
}
```

## ⚠️ Importante

1. **Isolamento**: Queries normais SEMPRE filtram por `workspaceId`
2. **Admin**: Queries admin NUNCA filtram por `workspaceId`
3. **Validação**: Sempre valide admin antes de queries sem workspaceId
4. **Segurança**: Apenas usuários com `GlobalUser.role = 'ADMIN'` podem acessar

## 🚀 Uso Prático

### Ver todos os workspaces

1. Acesse `/admin` (você precisa ser admin)
2. Veja estatísticas gerais
3. Explore workspaces na tabela
4. Clique em um workspace para ver detalhes

### Criar seu primeiro admin

```bash
# Via Prisma Studio
npx prisma studio

# Ou via script
node scripts/create-admin.js
```

## 📊 Componentes

- `AdminStatsCards`: Cards com estatísticas globais
- `AdminWorkspacesTable`: Tabela de workspaces com filtros

## 🔄 Próximos Passos

1. Criar migration para GlobalUser
2. Adicionar mais funcionalidades de gerenciamento
3. Adicionar logs de auditoria para ações admin
4. Criar interface para gerenciar GlobalUsers

