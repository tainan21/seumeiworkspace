// ============================================
// API Client Mock - mesma assinatura da API real
// ============================================

import type {
  ValidationResult,
  CreateWorkspaceInput,
  CreateWorkspaceResult,
  Template,
  CompatibilityResult,
  CompanyType,
} from "@/types/workspace"

// Simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================
// Templates
// ============================================

export async function fetchTemplates(): Promise<Template[]> {
  await delay(800)
  const res = await fetch("/api/mock/domains/templates")
  if (!res.ok) throw new Error("Falha ao carregar templates")
  const data = await res.json()
  return data.templates
}

// ============================================
// Validação de Identificador
// ============================================

export async function validateIdentifier(type: "CNPJ" | "CPF", value: string): Promise<ValidationResult> {
  await delay(500)
  const res = await fetch("/api/mock/domains/validate-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, value }),
  })
  if (!res.ok) throw new Error("Falha na validação")
  return res.json()
}

// ============================================
// Compatibilidade de Template
// ============================================

export async function checkTemplateCompatibility(
  templateId: string,
  features: string[],
  companyType: CompanyType,
): Promise<CompatibilityResult> {
  await delay(600)
  const res = await fetch("/api/mock/domains/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      payload: { templateId, features, companyType },
    }),
  })
  if (!res.ok) throw new Error("Falha ao verificar compatibilidade")
  const data = await res.json()
  return data.compatibility
}

// ============================================
// Criar Workspace
// ============================================

export async function createWorkspaceApi(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
  await delay(1500) // Simular processamento mais longo
  const res = await fetch("/api/mock/domains/workspace/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Falha ao criar workspace")
  return res.json()
}
