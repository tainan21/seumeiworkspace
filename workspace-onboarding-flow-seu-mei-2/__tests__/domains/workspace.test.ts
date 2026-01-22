// ============================================
// TESTS: Workspace Domain
// ============================================

import { describe, it, expect } from "vitest"
import { enforceSingleFreeWorkspace, assembleMenu, isSystemItem } from "@/domains/workspace/workspace"
import type { Workspace, MenuComponent } from "@/types/workspace"

describe("enforceSingleFreeWorkspace", () => {
  const mockWorkspace = (overrides: Partial<Workspace> = {}): Workspace => ({
    workspaceId: "ws_test",
    slug: "test",
    name: "Test",
    brand: { colors: { primary: "#000", accent: "#fff" } },
    company: { name: "Test Co" },
    apps: [],
    menuItems: [],
    topBarVariant: "barTop-A",
    theme: "minimal",
    ownerId: "user_1",
    settings: { billingPlan: "free", locale: "pt-BR", timezone: "America/Sao_Paulo" },
    rbac: { roles: [], defaultRole: "member" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  })

  it("deve permitir primeiro workspace free", () => {
    const result = enforceSingleFreeWorkspace("user_1", [], "free")
    expect(result.allowed).toBe(true)
  })

  it("deve bloquear segundo workspace free", () => {
    const existing = [mockWorkspace({ ownerId: "user_1" })]
    const result = enforceSingleFreeWorkspace("user_1", existing, "free")
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe("FREE_LIMIT_REACHED")
  })

  it("deve permitir até 3 workspaces para Pro", () => {
    const existing = [
      mockWorkspace({ workspaceId: "ws_1", ownerId: "user_1" }),
      mockWorkspace({ workspaceId: "ws_2", ownerId: "user_1" }),
    ]
    const result = enforceSingleFreeWorkspace("user_1", existing, "pro")
    expect(result.allowed).toBe(true)
  })

  it("deve bloquear 4º workspace Pro", () => {
    const existing = [
      mockWorkspace({ workspaceId: "ws_1", ownerId: "user_1" }),
      mockWorkspace({ workspaceId: "ws_2", ownerId: "user_1" }),
      mockWorkspace({ workspaceId: "ws_3", ownerId: "user_1" }),
    ]
    const result = enforceSingleFreeWorkspace("user_1", existing, "pro")
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe("LIMIT_REACHED_PRO")
  })

  it("deve permitir ilimitado para Enterprise", () => {
    const existing = Array(10)
      .fill(null)
      .map((_, i) => mockWorkspace({ workspaceId: `ws_${i}`, ownerId: "user_1" }))
    const result = enforceSingleFreeWorkspace("user_1", existing, "enterprise")
    expect(result.allowed).toBe(true)
  })

  it("deve considerar createdBy além de ownerId", () => {
    const existing = [mockWorkspace({ ownerId: "other", createdBy: "user_1" })]
    const result = enforceSingleFreeWorkspace("user_1", existing, "free")
    expect(result.allowed).toBe(false)
  })
})

describe("assembleMenu", () => {
  const mockComponents: MenuComponent[] = [
    { id: "projects", type: "item", label: "Projetos", icon: "FolderKanban" },
    { id: "docs", type: "item", label: "Docs", icon: "FileText" },
    { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
  ]

  it("deve ordenar dashboard primeiro", () => {
    const result = assembleMenu(mockComponents, ["projects", "docs"])
    expect(result[0].id).toBe("dashboard")
  })

  it("deve adicionar settings automaticamente", () => {
    const result = assembleMenu(mockComponents, ["projects"])
    const settings = result.find((m) => m.id === "settings")
    expect(settings).toBeDefined()
    expect(settings?.order).toBe(99)
  })

  it("deve filtrar apps não habilitados", () => {
    const result = assembleMenu(mockComponents, ["projects"])
    const docs = result.find((m) => m.id === "docs")
    expect(docs).toBeUndefined()
  })

  it("deve manter items de sistema mesmo sem estar em apps", () => {
    const components: MenuComponent[] = [
      { id: "dashboard", type: "item" },
      { id: "settings", type: "item" },
    ]
    const result = assembleMenu(components, [])
    expect(result.some((m) => m.id === "dashboard")).toBe(true)
    expect(result.some((m) => m.id === "settings")).toBe(true)
  })
})

describe("isSystemItem", () => {
  it("deve identificar dashboard como sistema", () => {
    expect(isSystemItem("dashboard")).toBe(true)
  })

  it("deve identificar settings como sistema", () => {
    expect(isSystemItem("settings")).toBe(true)
  })

  it("deve rejeitar items não-sistema", () => {
    expect(isSystemItem("projects")).toBe(false)
    expect(isSystemItem("finances")).toBe(false)
  })
})
