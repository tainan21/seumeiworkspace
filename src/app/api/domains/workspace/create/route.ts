// ============================================
// API: POST /api/domains/workspace/create
// Handler REAL que usa domains e persiste no DB
// Fallback para mock se DB não disponível
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import { createWorkspace } from "@/domains/workspace/workspace"
import { isDatabaseAvailable } from "@/lib/db/client"
import {
  createWorkspaceInDb,
  findWorkspacesByOwnerId,
  transformDbToWorkspace,
  findWorkspaceById,
  type CreateWorkspaceData,
} from "@/lib/db/repositories/workspace.repository"
import type { CreateWorkspaceInput, CreateWorkspaceContext } from "@/types/workspace"

// Mock user para desenvolvimento (será substituído por auth)
const MOCK_USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
const MOCK_USER_PLAN = "free" as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input básico
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, errors: [{ code: "VALIDATION_ERROR", message: "Nome é obrigatório" }] },
        { status: 400 },
      )
    }

    // Montar input para domain
    const input: CreateWorkspaceInput = {
      userId: body.userId || MOCK_USER_ID,
      name: body.name,
      slug: body.slug,
      brand: body.brand || { colors: { primary: "#18181B", accent: "#3B82F6" } },
      company: body.company || { name: body.name },
      theme: body.theme || "minimal",
      companyType: body.companyType || "Simples",
      employeeCount: body.employeeCount,
      revenueRange: body.revenueRange,
      template: body.template,
      selectedFeatures: body.selectedFeatures || [],
      menuComponents: body.menuComponents || [],
      topBarVariant: body.topBarVariant || "barTop-A",
    }

    // Verificar se DB está disponível
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable) {
      // FLUXO REAL: Usar DB
      return await handleWithDatabase(input)
    } else {
      // FALLBACK: Usar mock (mesma resposta que /api/mock/...)
      return await handleWithMock(input)
    }
  } catch (error) {
    console.error("[API] Erro ao criar workspace:", error)
    return NextResponse.json(
      { success: false, errors: [{ code: "INTERNAL_ERROR", message: "Erro interno do servidor" }] },
      { status: 500 },
    )
  }
}

// ============================================
// HANDLER: Com Database
// ============================================

async function handleWithDatabase(input: CreateWorkspaceInput) {
  // 1. Buscar workspaces existentes do usuário
  const existingWorkspaces = await findWorkspacesByOwnerId(input.userId)

  // 2. Montar contexto
  const context: CreateWorkspaceContext = {
    existingWorkspaces: existingWorkspaces.map(
      (w) =>
        ({
          workspaceId: w.id,
          slug: w.slug,
          name: w.name,
          ownerId: w.owner_id,
          createdBy: w.created_by,
          settings: { billingPlan: w.billing_plan as any, locale: w.locale, timezone: w.timezone },
        }) as any,
    ),
    userPlan: MOCK_USER_PLAN,
  }

  // 3. Executar regras de domain
  const result = await createWorkspace(input, context)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  // 4. Persistir no banco
  const workspaceData: CreateWorkspaceData = {
    slug: result.workspace.slug,
    name: result.workspace.name,
    ownerId: result.workspace.ownerId,
    createdBy: result.workspace.createdBy || result.workspace.ownerId,
    theme: result.workspace.theme,
    topBarVariant: result.workspace.topBarVariant,
    billingPlan: result.workspace.settings.billingPlan,
    brand: {
      logoUrl: result.workspace.brand.logo,
      primaryColor: result.workspace.brand.colors.primary,
      accentColor: result.workspace.brand.colors.accent,
    },
    company: {
      name: result.workspace.company.name,
      identifierType: result.workspace.company.identifier?.type,
      identifierValue: result.workspace.company.identifier?.value,
      companyType: input.companyType,
      employeeCount: input.employeeCount,
      revenueRange: input.revenueRange,
    },
    apps: result.workspace.apps,
    menuItems: result.workspace.menuItems,
    rbac: result.workspace.rbac,
  }

  const dbWorkspace = await createWorkspaceInDb(workspaceData)

  // 5. Buscar workspace completo para retornar
  const completeWorkspace = await findWorkspaceById(dbWorkspace.id)

  if (!completeWorkspace) {
    return NextResponse.json(
      { success: false, errors: [{ code: "PERSIST_ERROR", message: "Erro ao buscar workspace criado" }] },
      { status: 500 },
    )
  }

  // 6. Transformar para formato domain e retornar
  const workspace = transformDbToWorkspace(completeWorkspace)

  return NextResponse.json({ success: true, workspace })
}

// ============================================
// HANDLER: Fallback Mock
// ============================================

async function handleWithMock(input: CreateWorkspaceInput) {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Usar função de domain para criar workspace em memória
  const context: CreateWorkspaceContext = {
    existingWorkspaces: [],
    userPlan: MOCK_USER_PLAN,
  }

  const result = await createWorkspace(input, context)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  // Salvar em localStorage seria feito pelo client
  return NextResponse.json(result)
}
