// ============================================
// API MOCK: POST /api/mock/domains/workspace/create
// Delega para domain - mesma assinatura que API real
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import { createWorkspace } from "@/domains/workspace/workspace"
import type { CreateWorkspaceInput, CreateWorkspaceContext } from "@/types/workspace"
import { MOCK_CURRENT_USER, MOCK_EXISTING_WORKSPACES } from "@/lib/mock-data/users"

export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkspaceInput = await request.json()

    // Contexto mock - em produção viria do banco
    const context: CreateWorkspaceContext = {
      existingWorkspaces: MOCK_EXISTING_WORKSPACES,
      userPlan: MOCK_CURRENT_USER.plan,
    }

    // Garantir userId vem do usuário autenticado (mock)
    const input: CreateWorkspaceInput = {
      ...body,
      userId: MOCK_CURRENT_USER.id,
    }

    // Delegar para domain
    const result = await createWorkspace(input, context)

    if (result.success) {
      return NextResponse.json({
        success: true,
        workspace: result.workspace,
      })
    }

    return NextResponse.json(
      {
        success: false,
        errors: result.errors,
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] Workspace create error:", error)
    return NextResponse.json(
      {
        success: false,
        errors: [{ code: "SERVER_ERROR", message: "Erro interno do servidor" }],
      },
      { status: 500 },
    )
  }
}
