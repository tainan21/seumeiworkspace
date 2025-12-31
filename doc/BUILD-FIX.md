# Build Fix - Server Actions Error

## ❌ Erro Original

```
Only async functions are allowed to be exported in a "use server" file.
```

**Problema**: Classes de erro (`WorkspaceLimitError`, `ProjectLimitError`) estavam sendo exportadas de um arquivo com `"use server"`, o que não é permitido pelo Next.js.

## ✅ Solução Aplicada

### Separação de Responsabilidades

Criado arquivo separado para classes de erro:

**`src/lib/server/workspace/errors.ts`**
- Sem `"use server"`
- Contém apenas classes de erro
- Pode ser importado tanto no servidor quanto no cliente

**`src/lib/server/workspace/limits.ts`**
- Com `"use server"`
- Contém apenas funções async (server actions)
- Re-exporta errors para conveniência

**`src/lib/server/workspace/index.ts`**
- Re-exporta tudo
- Facilita imports

### Imports Atualizados

- `create-project-modal.tsx`: Importa de `~/lib/server/workspace/errors`
- `action.ts`: Importa errors de `~/lib/server/workspace/errors`

## 📋 Estrutura Final

```
src/lib/server/workspace/
  ├── errors.ts      ← Classes de erro (sem "use server")
  ├── limits.ts      ← Server actions (com "use server")
  └── index.ts       ← Re-exports
```

## ✅ Resultado

- ✅ Build passa sem erros
- ✅ Separação clara de responsabilidades
- ✅ Classes de erro podem ser usadas em client components
- ✅ Server actions funcionam corretamente
- ✅ 0 erros de lint/TypeScript

