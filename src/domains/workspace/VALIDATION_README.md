# Validação de Nome de Workspace - Implementação Domain

## 📋 Resumo da Implementação

Validação de nome de workspace implementada seguindo rigorosamente o **ContratoDeSistemaImutavel.md**.

## ✅ Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/domains/workspace/validation.ts`** - Função pura de validação
   - `validateWorkspaceName()` - Função principal de validação
   - `WORKSPACE_NAME_VALIDATION` - Constantes de validação
   - `WorkspaceNameValidationResult` - Type de retorno

2. **`src/domains/workspace/VALIDATION_USAGE.md`** - Guia de uso
   - Exemplos de uso em diferentes camadas
   - Casos de uso práticos

3. **`src/domains/workspace/validation.test.example.ts`** - Testes de exemplo
   - 25+ casos de teste
   - Cobertura completa das regras

### Arquivos Modificados

1. **`src/domains/workspace/errors.ts`**
   - Adicionado: `WorkspaceValidationError` class

2. **`src/domains/workspace/index.ts`**
   - Adicionado: `export * from "./validation"`

## 📏 Regras de Validação Implementadas

| Regra | Descrição | Mensagem de Erro |
|-------|-----------|------------------|
| Comprimento mínimo | 3 caracteres | "Nome do workspace deve ter no mínimo 3 caracteres" |
| Comprimento máximo | 50 caracteres | "Nome do workspace deve ter no máximo 50 caracteres" |
| Caracteres permitidos | Letras, números, espaços, hífens | "Nome do workspace deve conter apenas letras, números, espaços e hífens" |
| Início com espaço | Não permitido | "Nome do workspace não pode começar ou terminar com espaço" |
| Fim com espaço | Não permitido | "Nome do workspace não pode começar ou terminar com espaço" |
| Início com hífen | Não permitido | "Nome do workspace não pode começar ou terminar com hífen" |
| Fim com hífen | Não permitido | "Nome do workspace não pode começar ou terminar com hífen" |
| Palavras reservadas | "admin", "api", "system" (case-insensitive) | "Nome do workspace não pode conter a palavra reservada \"{palavra}\"" |

## 🎯 Conformidade com Contrato Imutável

### ✅ Princípios Seguidos

- **Framework-agnostic**: TypeScript puro, sem dependências externas
- **Função pura**: Sem efeitos colaterais, determinística
- **Testável**: Pode ser testada isoladamente
- **Localização correta**: `src/domains/workspace/` (Domain Layer)
- **Sem importações proibidas**: Não importa React, Next, DB, Infra
- **Type-safe**: Totalmente tipado com TypeScript

### 📐 Arquitetura em Camadas

```
Domain Layer (✅)
  ↓
src/domains/workspace/validation.ts
  - validateWorkspaceName() [função pura]
  - WORKSPACE_NAME_VALIDATION [constantes]
  - WorkspaceNameValidationResult [type]
```

## 🔧 Como Usar

### Importação

```typescript
import { 
  validateWorkspaceName,
  WorkspaceValidationError,
  WORKSPACE_NAME_VALIDATION 
} from "~/domains/workspace";
```

### Uso Básico

```typescript
const result = validateWorkspaceName("Meu Workspace");

if (!result.valid) {
  console.error(result.error); // Mensagem descritiva
  throw new WorkspaceValidationError(result.error!);
}

// Prosseguir com nome válido
```

### Integração com Application Layer

```typescript
"use server";

import { validateWorkspaceName } from "~/domains/workspace";

export async function createWorkspace(name: string) {
  // 1. Validar usando Domain
  const validation = validateWorkspaceName(name);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // 2. Prosseguir com lógica de negócio
  // ...
}
```

## 🧪 Testes

Arquivo de exemplo: `validation.test.example.ts`

Para usar:
1. Renomeie para `validation.test.ts`
2. Configure Jest/Vitest
3. Execute: `npm test`

Cobertura de testes:
- ✅ Casos válidos (5 cenários)
- ✅ Comprimento inválido (3 cenários)
- ✅ Caracteres inválidos (3 cenários)
- ✅ Início/fim inválido (4 cenários)
- ✅ Palavras reservadas (4 cenários)
- ✅ Tipo inválido (1 cenário)
- ✅ Determinismo (1 cenário)

## 📊 Estrutura de Retorno

```typescript
type WorkspaceNameValidationResult = {
  valid: boolean;   // true se válido, false se inválido
  error?: string;   // Mensagem descritiva do erro (somente se invalid)
};
```

## 🚀 Próximos Passos (Opcional)

1. **Integrar em Server Actions existentes**
   - Adicionar validação em funções de criação de workspace
   - Usar `WorkspaceValidationError` para tratamento de erros

2. **Adicionar validação em UI**
   - Validação em tempo real em formulários
   - Feedback visual para usuário

3. **Configurar testes**
   - Adicionar framework de testes (Jest/Vitest)
   - Renomear `validation.test.example.ts` → `validation.test.ts`

## 📝 Notas de Implementação

- **Sem dependências externas**: Função totalmente standalone
- **Performance**: O(n) onde n = tamanho do nome (muito eficiente)
- **Internacionalização**: Mensagens em português (pode ser estendido)
- **Extensibilidade**: Fácil adicionar novas regras sem quebrar existentes

---

**Implementado por:** Tai + Zara ORACLE  
**Data:** 2025-01-07  
**Versão:** 1.0  
**Conformidade:** ContratoDeSistemaImutavel.md v1

