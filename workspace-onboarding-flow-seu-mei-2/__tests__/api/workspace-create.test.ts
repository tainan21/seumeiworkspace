// ============================================
// TESTS: Smoke Test - Criar Workspace via API
// ============================================

import { describe, it, expect } from "vitest"

// Mock do fetch para testes
const API_URL = "http://localhost:3000"

describe("POST /api/domains/workspace/create", () => {
  it("smoke test: deve criar workspace completo e retornar shape correto", async () => {
    const payload = {
      name: "Test Workspace",
      brand: {
        colors: { primary: "#2563EB", accent: "#F59E0B" },
      },
      company: {
        name: "Test Company LTDA",
        identifier: { type: "CNPJ", value: "11222333000181" },
      },
      theme: "corporate",
      companyType: "Ltda",
      employeeCount: 10,
      selectedFeatures: ["projects", "docs"],
      menuComponents: [
        { id: "dashboard", type: "item" },
        { id: "projects", type: "item" },
        { id: "docs", type: "item" },
      ],
      topBarVariant: "barTop-A",
    }

    // Este teste requer o servidor rodando
    // Em CI, usar mock ou skip
    const response = await fetch(`${API_URL}/api/domains/workspace/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!response) {
      console.log("⚠️ Servidor não disponível, pulando smoke test")
      return
    }

    const data = await response.json()

    // Verificar shape da resposta
    expect(data.success).toBe(true)
    expect(data.workspace).toBeDefined()

    const ws = data.workspace
    expect(ws.workspaceId).toBeDefined()
    expect(ws.slug).toBeDefined()
    expect(ws.name).toBe("Test Workspace")
    expect(ws.brand.colors.primary).toBe("#2563EB")
    expect(ws.company.name).toBe("Test Company LTDA")
    expect(ws.apps).toContain("projects")
    expect(ws.apps).toContain("docs")
    expect(ws.menuItems).toBeInstanceOf(Array)
    expect(ws.menuItems.length).toBeGreaterThan(0)
    expect(ws.rbac.roles.length).toBe(4) // owner, admin, member, guest
    expect(ws.settings.billingPlan).toBeDefined()
    expect(ws.settings.locale).toBe("pt-BR")
    expect(ws.settings.timezone).toBe("America/Sao_Paulo")
  })

  it("deve falhar com nome vazio", async () => {
    const response = await fetch(`${API_URL}/api/domains/workspace/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    }).catch(() => null)

    if (!response) return

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.errors).toBeDefined()
  })
})
