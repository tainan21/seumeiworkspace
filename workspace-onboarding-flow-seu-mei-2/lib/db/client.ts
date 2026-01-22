// ============================================
// DATABASE CLIENT
// Wrapper para conexão com banco
// ============================================

// NOTA: Este arquivo será usado quando integração com DB real estiver pronta
// Por enquanto, exporta tipos e funções placeholder

export type DatabaseClient = {
  query: <T>(sql: string, params?: unknown[]) => Promise<T[]>
  queryOne: <T>(sql: string, params?: unknown[]) => Promise<T | null>
  execute: (sql: string, params?: unknown[]) => Promise<{ rowCount: number }>
  transaction: <T>(fn: (tx: DatabaseClient) => Promise<T>) => Promise<T>
}

// Placeholder - será substituído por neon() ou supabase client
let dbClient: DatabaseClient | null = null

export function getDbClient(): DatabaseClient {
  if (!dbClient) {
    // Mock client para desenvolvimento sem DB
    dbClient = createMockClient()
  }
  return dbClient
}

export function setDbClient(client: DatabaseClient): void {
  dbClient = client
}

// Mock client que usa dados in-memory
function createMockClient(): DatabaseClient {
  return {
    query: async () => {
      console.warn("[DB] Mock client - query não implementada")
      return []
    },
    queryOne: async () => {
      console.warn("[DB] Mock client - queryOne não implementada")
      return null
    },
    execute: async () => {
      console.warn("[DB] Mock client - execute não implementada")
      return { rowCount: 0 }
    },
    transaction: async (fn) => {
      return fn(createMockClient())
    },
  }
}

// ============================================
// HELPER: Verifica se DB está disponível
// ============================================

export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Tenta uma query simples
    const client = getDbClient()
    await client.query("SELECT 1")
    return true
  } catch {
    return false
  }
}
