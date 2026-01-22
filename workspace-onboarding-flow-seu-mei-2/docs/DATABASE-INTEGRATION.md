# Integração com Banco de Dados

## Visão Geral

Este documento descreve como integrar o onboarding do Seumei com um banco de dados PostgreSQL real.

## Pré-requisitos

1. Banco PostgreSQL 14+
2. Variável de ambiente `DATABASE_URL`
3. Extensões `uuid-ossp` e `pg_trgm`

## Setup

### 1. Executar DDL

```bash
psql $DATABASE_URL -f scripts/001-ddl.sql
```

### 2. Popular Seed Data

```bash
psql $DATABASE_URL -f scripts/002-seed-templates.sql
psql $DATABASE_URL -f scripts/003-seed-example-workspace.sql
```

### 3. Configurar Client

Em `lib/db/client.ts`, substituir o mock client pelo cliente real:

```typescript
// Para Neon
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

setDbClient({
  query: async (sql, params) => sql(sql, params),
  queryOne: async (sql, params) => {
    const result = await sql(sql, params)
    return result[0] || null
  },
  // ...
})

// Para Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

setDbClient({
  query: async (sql, params) => {
    const { data, error } = await supabase.rpc('query', { sql, params })
    if (error) throw error
    return data
  },
  // ...
})
```

## Arquitetura

```
UI (não alterada)
    ↓
Store (Zustand)
    ↓
API Route (/api/domains/workspace/create)
    ↓
Domain (validações, regras)
    ↓
Repository (abstração DB)
    ↓
Database Client
    ↓
PostgreSQL
```

## Fallback Mock

Se o banco não estiver disponível, a API automaticamente usa o mock:

```typescript
const dbAvailable = await isDatabaseAvailable()

if (dbAvailable) {
  return await handleWithDatabase(input)
} else {
  return await handleWithMock(input) // Mesmo shape de resposta
}
```

## Migração de Dados Mock

Para migrar dados do localStorage para o banco:

```typescript
import { migrateMockSettings } from '@/scripts/004-migrate-mock-settings'

// Executar uma vez por usuário
await migrateMockSettings()
```

## Testes

```bash
# Unit tests (não requerem banco)
pnpm test

# Smoke tests (requerem servidor rodando)
pnpm dev &
pnpm test:smoke
```

## Checklist de Integração

- [ ] DATABASE_URL configurada
- [ ] DDL executado
- [ ] Seeds populados
- [ ] Client configurado em `lib/db/client.ts`
- [ ] Testes passando
- [ ] UI funcionando sem alterações
```
