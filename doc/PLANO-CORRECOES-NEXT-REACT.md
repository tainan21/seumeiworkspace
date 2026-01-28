# 📋 Plano de Correções Next.js 16 + React 19

## 🎯 Objetivo
Corrigir problemas de TypeScript, otimizar uso de Server/Client Components, e aplicar melhores práticas do Next.js 16 App Router e React 19.

---

## 🔴 PRIORIDADE ALTA - Erros Críticos

### 1. TypeScript: `verbatimModuleSyntax` - Imports de Tipos

**Problema**: TypeScript 5.7 com `verbatimModuleSyntax: true` exige `import type` para tipos.

**Arquivos Afetados**:
- `src/app/[locale]/_components/common/GradientButton.tsx`
- `src/app/[locale]/_components/common/useIntersection.ts`
- `src/app/[locale]/Onboarding/layout.tsx`
- `src/components/onboarding/onboarding-wrapper.tsx`
- `src/components/onboarding/primitives/menu-builder.tsx`
- E outros...

**Correção**:
```typescript
// ❌ ERRADO
import { MouseEventHandler } from "react";

// ✅ CORRETO
import type { MouseEventHandler } from "react";
```

**Ação**: Buscar todos os imports de tipos e adicionar `type`.

---

### 2. Timer TypeScript Error (Node.js vs Browser)

**Problema**: `CopyToClipboard/index.tsx` - conflito de tipos `Timer` vs `Timeout`.

**Arquivo**: `src/app/[locale]/_components/common/CopyToClipboard/index.tsx`

**Correção**:
```typescript
// ❌ ERRADO
let timeoutId: NodeJS.Timer | undefined;

// ✅ CORRETO
let timeoutId: ReturnType<typeof setTimeout> | undefined;
// ou
let timeoutId: number | undefined; // Browser
```

---

### 3. Imports Incorretos de Módulos

**Problema**: 
- `Collider.tsx` importa de caminho errado
- `editable-details.tsx` importa exports inexistentes

**Arquivos**:
- `src/app/[locale]/_components/Virtualization/Collider.tsx`
- `src/app/[locale]/dashboard/workspaces/[workspaceId]/editable-details.tsx`

**Correção**: Corrigir paths e exports.

---

## 🟡 PRIORIDADE MÉDIA - Otimizações

### 4. Uso Excessivo de `"use client"`

**Problema**: 202 arquivos com `"use client"` - muitos poderiam ser Server Components.

**Análise**:
- ✅ **Server Components** (padrão): Componentes que não precisam de interatividade
- ⚠️ **Client Components** (apenas quando necessário): 
  - Hooks (`useState`, `useEffect`, `useContext`)
  - Event handlers (`onClick`, `onChange`)
  - Browser APIs (`window`, `document`, `localStorage`)
  - Third-party libs que requerem client

**Estratégia**:
1. Identificar componentes que usam apenas `useEffect` para side effects não interativos
2. Mover lógica para Server Components ou Server Actions
3. Extrair apenas partes interativas para Client Components pequenos

**Exemplo**:
```typescript
// ❌ ERRADO - Client Component desnecessário
"use client";
export function PageHeader({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// ✅ CORRETO - Server Component
export function PageHeader({ title }: { title: string }) {
  return <h1>{title}</h1>;
}
```

---

### 5. `useEffect` para Hydration Mismatch

**Problema**: `app-providers.tsx` usa `useEffect` para evitar hydration mismatch.

**Arquivo**: `src/app/[locale]/app-providers.tsx`

**Correção**:
```typescript
// ❌ ATUAL
useEffect(() => {
  document.documentElement.setAttribute("data-theme-preset", themePreset);
}, [themePreset]);

// ✅ MELHOR - Usar script no layout (já existe, mas pode melhorar)
// No layout.tsx já tem:
<script
  dangerouslySetInnerHTML={{
    __html: `document.documentElement.setAttribute('data-theme-preset', '${themePreset}');`,
  }}
/>
```

**Ação**: Remover `useEffect` duplicado e garantir script no layout.

---

### 6. Server Actions - Validação e Tipos

**Problema**: Server Actions sem validação adequada e tipos inconsistentes.

**Arquivos**:
- `src/app/[locale]/dashboard/workspaces/actions.ts`
- `src/app/[locale]/dashboard/workspaces/create-project-modal.tsx`

**Correção**:
```typescript
// ✅ Adicionar validação com Zod
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export async function createWorkspace(data: unknown) {
  const validated = createWorkspaceSchema.parse(data);
  // ...
}
```

---

## 🟢 PRIORIDADE BAIXA - Melhorias

### 7. Suspense Boundaries

**Problema**: Falta de Suspense boundaries para loading states.

**Ação**: Adicionar Suspense em:
- Layouts que fazem fetch de dados
- Rotas dinâmicas
- Componentes lazy-loaded

**Exemplo**:
```typescript
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  );
}
```

---

### 8. Error Boundaries

**Status**: ✅ Já existe `global-error.tsx` e `error.tsx` em rotas.

**Melhoria**: Adicionar error boundaries mais granulares em componentes críticos.

---

### 9. Metadata e SEO

**Status**: ✅ Já existe `generateMetadata` em layouts.

**Melhoria**: 
- Adicionar metadata dinâmica em páginas que faltam
- Otimizar Open Graph images
- Adicionar structured data (JSON-LD)

---

### 10. Performance - Code Splitting

**Problema**: Componentes grandes sem lazy loading.

**Ação**:
```typescript
// ✅ Lazy load componentes pesados
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./heavy-component"), {
  loading: () => <Skeleton />,
  ssr: false, // Se não precisa de SSR
});
```

---

## 📊 Checklist de Implementação

### Fase 1: Correções Críticas (1-2 dias)
- [ ] Corrigir todos os imports de tipos (`import type`)
- [ ] Corrigir erro de Timer no CopyToClipboard
- [ ] Corrigir imports incorretos de módulos
- [ ] Validar que build passa sem erros TypeScript

### Fase 2: Otimizações (2-3 dias)
- [ ] Auditar uso de `"use client"` - remover desnecessários
- [ ] Mover lógica de `useEffect` para Server Components quando possível
- [ ] Adicionar validação Zod em Server Actions
- [ ] Corrigir hydration mismatches

### Fase 3: Melhorias (1-2 dias)
- [ ] Adicionar Suspense boundaries
- [ ] Melhorar error boundaries
- [ ] Otimizar metadata e SEO
- [ ] Implementar code splitting em componentes pesados

---

## 🔧 Ferramentas e Comandos

### Verificar erros TypeScript
```bash
npx tsc --noEmit
```

### Verificar uso de "use client"
```bash
grep -r '"use client"' src/ | wc -l
```

### Build de produção
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

---

## 📚 Referências

- [Next.js 16 App Router Docs](https://nextjs.org/docs/app)
- [React 19 Docs](https://react.dev)
- [TypeScript verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

---

## 🎯 Métricas de Sucesso

- ✅ Zero erros TypeScript no build
- ✅ Redução de 30-40% no uso de `"use client"`
- ✅ Build time reduzido em 20%
- ✅ Bundle size reduzido em 15%
- ✅ Lighthouse score > 90

---

**Última atualização**: 2025-01-10
**Versão**: 1.0
