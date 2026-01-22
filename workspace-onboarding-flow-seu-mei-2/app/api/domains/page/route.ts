// ============================================
// API: Pages - Listar e Criar
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import { createPage } from "@/domains/page/page"
import { createPageInDb, findPagesByWorkspace } from "@/lib/db/repositories/page.repository"
import type { CreatePageInput, PageFilters } from "@/domains/page/page.types"

// GET /api/domains/page?workspaceId=...&visibility=...&parentId=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId é obrigatório" }, { status: 400 })
    }

    const filters: PageFilters = {
      workspaceId,
      visibility: searchParams.get("visibility") as any,
      parentId: searchParams.get("parentId") || undefined,
      searchQuery: searchParams.get("search") || undefined,
      includeDeleted: searchParams.get("includeDeleted") === "true",
    }

    // Buscar do banco
    const pages = await findPagesByWorkspace(workspaceId, filters)

    return NextResponse.json({ pages }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching pages:", error)
    return NextResponse.json({ error: "Erro ao buscar páginas" }, { status: 500 })
  }
}

// POST /api/domains/page
export async function POST(request: NextRequest) {
  try {
    const input: CreatePageInput = await request.json()

    // Buscar páginas existentes para validação
    const existingPages = await findPagesByWorkspace(input.workspaceId, { includeDeleted: false })

    // Criar página usando domain
    const result = createPage(input, existingPages)

    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 400 })
    }

    // Persistir no banco
    const dbPage = await createPageInDb(result.page)

    return NextResponse.json({ page: result.page }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating page:", error)
    return NextResponse.json({ error: "Erro ao criar página" }, { status: 500 })
  }
}
