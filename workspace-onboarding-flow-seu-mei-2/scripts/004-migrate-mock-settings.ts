import { migrateFromMockSettings } from "../lib/db/repositories/user-settings.repository"

// Mock data que seria lido do localStorage do usuário
const MOCK_USER_SETTINGS = {
  userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  settings: {
    theme: "corporate",
    defaultWorkspaceId: null, // Será preenchido após buscar workspace
    locale: "pt-BR",
    notifications: true,
  },
}

async function main() {
  console.log("🔄 Iniciando migração de mockUserSettings...")

  // NOTA: Configurar client real antes de executar
  // setDbClient(neonClient ou supabaseClient)

  try {
    const result = await migrateFromMockSettings(MOCK_USER_SETTINGS.userId, MOCK_USER_SETTINGS.settings)

    console.log("✅ Settings migrados:", result)
  } catch (error) {
    console.error("❌ Erro na migração:", error)
    process.exit(1)
  }
}

// Descomentar para executar
// main()

export { main as migrateMockSettings }
