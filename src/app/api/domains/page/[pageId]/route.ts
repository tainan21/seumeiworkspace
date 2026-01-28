// ============================================
// API: Page - Buscar, Atualizar, Deletar por ID
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import { updatePage, deletePage, restorePage } from "@/domains/page/page"
import {
  findPageById,
  updatePageInDb,
  softDeletePage,
  restorePageInDb,
  findPagesByWorkspace,
} from "@/lib/db/repositories/page.repository"
import type { UpdatePageInput } from "@/domains/page/page.types"

// GET /api/domains/page/[pageId]
export async function GET(request: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const page = await findPageById(params.pageId)

    if (!page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ page }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching page:", error)
    return NextResponse.json({ error: "Erro ao buscar página" }, { status: 500 })
  }
}

// PATCH /api/domains/page/[pageId]
export async function PATCH(request: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const updates: UpdatePageInput = await request.json()

    // Buscar página existente
    const existing = await findPageById(params.pageId)
    if (!existing) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 })
    }

    // Buscar todas páginas para validação de hierarquia
    const allPages = await findPagesByWorkspace(existing.workspaceId, { includeDeleted: false })

    // Atualizar usando domain
    const result = updatePage(existing, updates, allPages)

    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 400 })
    }

    // Persistir no banco
    await updatePageInDb(result.page)

    return NextResponse.json({ page: result.page }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error updating page:", error)
    return NextResponse.json({ error: "Erro ao atualizar página" }, { status: 500 })
  }
}

// DELETE /api/domains/page/[pageId]?restore=true
export async function DELETE(request: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const { searchParams } = request.nextUrl
    const shouldRestore = searchParams.get("restore") === "true"

    const existing = await findPageById(params.pageId)
    if (!existing) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 })
    }

    if (shouldRestore) {
      const restored = restorePage(existing)
      await restorePageInDb(params.pageId)
      return NextResponse.json({ page: restored, message: "Página restaurada" }, { status: 200 })
    } else {
      const deleted = deletePage(existing)
      await softDeletePage(params.pageId)
      return NextResponse.json({ page: deleted, message: "Página deletada" }, { status: 200 })
    }
  } catch (error) {
    console.error("[v0] Error deleting/restoring page:", error)
    return NextResponse.json({ error: "Erro ao deletar/restaurar página" }, { status: 500 })
  }
}
