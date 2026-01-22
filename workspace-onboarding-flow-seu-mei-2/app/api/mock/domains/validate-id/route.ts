// ============================================
// API MOCK: POST /api/mock/domains/validate-id
// Delega para domain - mesma assinatura que API real
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import { validateCompanyIdentifier } from "@/domains/company/company"
import type { IdentifierType } from "@/types/workspace"

interface ValidateIdRequest {
  type: IdentifierType
  value: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateIdRequest = await request.json()

    // Delegar para domain
    const result = validateCompanyIdentifier(body.value, body.type)

    // Converter para formato de API
    return NextResponse.json({
      valid: result.status !== "invalid",
      status: result.status,
      formatted: result.formatted,
      errors: result.errors,
      message: result.message,
    })
  } catch {
    return NextResponse.json(
      { valid: false, status: "invalid", errors: ["Erro ao processar requisição"] },
      { status: 400 },
    )
  }
}
