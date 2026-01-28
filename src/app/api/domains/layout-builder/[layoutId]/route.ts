// ============================================
// API ROUTE: Layout Builder - Single Layout
// Endpoints para operacoes em layout especifico
// ============================================

import { NextRequest, NextResponse } from "next/server"
import {
  getLayoutById,
  updateLayout,
  setActiveLayout,
  deleteLayout,
} from "@/lib/db/repositories/layout.repository"

interface RouteParams {
  params: Promise<{ layoutId: string }>
}

/**
 * GET /api/domains/layout-builder/[layoutId]
 * Busca layout por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { layoutId } = await params

    const layout = await getLayoutById(layoutId)

    if (!layout) {
      return NextResponse.json(
        { error: "Layout nao encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ layout })
  } catch (error) {
    console.error("[layout-builder] GET error:", error)
    return NextResponse.json(
      { error: "Erro ao buscar layout" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/domains/layout-builder/[layoutId]
 * Atualiza layout existente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { layoutId } = await params
    const body = await request.json()

    const result = await updateLayout(layoutId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Atualizacao falhou", errors: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ layout: result.layout })
  } catch (error) {
    console.error("[layout-builder] PATCH error:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar layout" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/domains/layout-builder/[layoutId]/activate
 * Define layout como ativo
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { layoutId } = await params
    const body = await request.json()
    const { workspaceId } = body

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId e obrigatorio" },
        { status: 400 }
      )
    }

    const result = await setActiveLayout(workspaceId, layoutId)

    if (!result.success) {
      return NextResponse.json(
        { error: "Ativacao falhou", errors: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ layout: result.layout })
  } catch (error) {
    console.error("[layout-builder] PUT error:", error)
    return NextResponse.json(
      { error: "Erro ao ativar layout" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/domains/layout-builder/[layoutId]
 * Deleta layout
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { layoutId } = await params

    const success = await deleteLayout(layoutId)

    if (!success) {
      return NextResponse.json(
        { error: "Layout nao encontrado ou ja deletado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[layout-builder] DELETE error:", error)
    return NextResponse.json(
      { error: "Erro ao deletar layout" },
      { status: 500 }
    )
  }
}
