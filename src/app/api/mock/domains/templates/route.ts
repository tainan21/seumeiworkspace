// ============================================
// API MOCK: GET /api/mock/domains/templates
// Mesma assinatura que API real terá
// ============================================

import { NextResponse } from "next/server"
import { MOCK_TEMPLATES } from "@/lib/mock-data/templates"

export async function GET() {
  // Simular latência de rede
  await new Promise((resolve) => setTimeout(resolve, 200))

  return NextResponse.json({
    templates: MOCK_TEMPLATES,
    total: MOCK_TEMPLATES.length,
  })
}
