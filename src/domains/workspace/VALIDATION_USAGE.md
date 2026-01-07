# Validação de Nome de Workspace

## Uso da Função de Validação (Domain Layer)

A função `validateWorkspaceName` é uma função pura no Domain Layer que valida nomes de workspace segundo as regras de negócio.

### Importação

```typescript
import { validateWorkspaceName } from "~/domains/workspace";
```

### Exemplo de Uso Básico

```typescript
const result = validateWorkspaceName("Meu Workspace");

if (!result.valid) {
  console.error(result.error);
  // "Nome inválido"
} else {
  console.log("Nome válido!");
}
```

### Exemplo em Server Action (Application Layer)

```typescript
"use server";

import { validateWorkspaceName, WorkspaceValidationError } from "~/domains/workspace";
import { prisma } from "~/lib/server/db";

export async function createWorkspace(userId: string, name: string) {
  // 1. Validar nome usando Domain
  const validation = validateWorkspaceName(name);
  
  if (!validation.valid) {
    throw new WorkspaceValidationError(validation.error!);
  }
  
  // 2. Verificar limites (Application)
  const canCreate = await canUserCreateWorkspace(userId);
  if (!canCreate) {
    throw new WorkspaceLimitError();
  }
  
  // 3. Criar workspace (Infra)
  return await prisma.workspace.create({
    data: {
      name: name.trim(),
      createdById: userId,
    },
  });
}
```

### Exemplo em Componente React (UI Layer)

```typescript
"use client";

import { validateWorkspaceName } from "~/domains/workspace";
import { useState } from "react";

export function WorkspaceNameInput() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleChange = (value: string) => {
    setName(value);
    
    // Validação em tempo real usando Domain
    const result = validateWorkspaceName(value);
    setError(result.error);
  };

  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => handleChange(e.target.value)}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

## Regras de Validação

1. **Comprimento**: mínimo 3 caracteres, máximo 50
2. **Caracteres permitidos**: apenas letras, números, espaços e hífens
3. **Restrições de início/fim**: não pode começar ou terminar com espaço ou hífen
4. **Palavras reservadas**: não pode conter "admin", "api", "system" (case-insensitive)

## Conformidade com ContratoDeSistemaImutavel.md

✅ Função pura (TypeScript puro, sem dependências externas)  
✅ Framework-agnostic (sem React, Next, hooks)  
✅ Determinística (mesmo input = mesmo output)  
✅ Testável isoladamente  
✅ Sem efeitos colaterais  
✅ Sem acesso direto a DB ou Infra  
✅ Localizada no Domain (`src/domains/workspace/`)

## Estrutura de Retorno

```typescript
type WorkspaceNameValidationResult = {
  valid: boolean;
  error?: string;
};
```

- `valid: true` → Nome válido, sem erro
- `valid: false` → Nome inválido, `error` contém a mensagem descritiva

