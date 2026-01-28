// ============================================
// API ROUTE: Layout Builder
// Endpoints para configuracao de layout
// ============================================

import { NextRequest, NextResponse } from "next/server"
import {
  getWorkspaceLayouts,
  getActiveLayout,
  createLayout,
  getAllPresets,
} from "@/lib/db/repositories/layout.repository"
import { validateLayoutConfig, createLayoutConfig } from "@/domains/layout-builder/layout-builder"

/**
 * GET /api/domains/layout-builder
 * Busca layouts de um workspace ou lista presets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    const activeOnly = searchParams.get("activeOnly") === "true"
    const presetsOnly = searchParams.get("presetsOnly") === "true"

    // Retornar presets do sistema
    if (presetsOnly) {
      const presets = await getAllPresets()
      return NextResponse.json({ presets })
    }

    // Validar workspaceId
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId e obrigatorio" },
        { status: 400 }
      )
    }

    // Retornar apenas layout ativo
    if (activeOnly) {
      const layout = await getActiveLayout(workspaceId)
      return NextResponse.json({ layout })
    }

    // Retornar todos os layouts do workspace
    const layouts = await getWorkspaceLayouts(workspaceId)
    return NextResponse.json({ layouts })
  } catch (error) {
    console.error("[layout-builder] GET error:", error)
    return NextResponse.json(
      { error: "Erro ao buscar layouts" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/domains/layout-builder
 * Cria novo layout para workspace
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, name, description, config } = body

    // Validar campos obrigatorios
    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId e name sao obrigatorios" },
        { status: 400 }
      )
    }

    // Criar layout
    const result = await createLayout(workspaceId, config || {}, name, description)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validacao falhou", errors: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ layout: result.layout }, { status: 201 })
  } catch (error) {
    console.error("[layout-builder] POST error:", error)
    return NextResponse.json(
      { error: "Erro ao criar layout" },
      { status: 500 }
    )
  }
}
