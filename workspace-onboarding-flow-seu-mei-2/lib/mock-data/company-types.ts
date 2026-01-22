import type { CompanyType } from "@/types/workspace"

export interface CompanyTypeOption {
  id: CompanyType
  name: string
  description: string
  suggestedEmployeeRange: [number, number]
}

export const MOCK_COMPANY_TYPES: CompanyTypeOption[] = [
  {
    id: "MEI",
    name: "MEI",
    description: "Microempreendedor Individual",
    suggestedEmployeeRange: [1, 1],
  },
  {
    id: "Simples",
    name: "Simples Nacional",
    description: "Micro e Pequenas Empresas",
    suggestedEmployeeRange: [1, 20],
  },
  {
    id: "EIRELI",
    name: "EIRELI",
    description: "Empresa Individual",
    suggestedEmployeeRange: [1, 50],
  },
  {
    id: "Ltda",
    name: "Ltda",
    description: "Sociedade Limitada",
    suggestedEmployeeRange: [2, 200],
  },
  {
    id: "SA",
    name: "S.A.",
    description: "Sociedade Anônima",
    suggestedEmployeeRange: [10, 1000],
  },
  {
    id: "Startup",
    name: "Startup",
    description: "Empresa de base tecnológica",
    suggestedEmployeeRange: [1, 100],
  },
]

export const MOCK_REVENUE_RANGES = [
  { id: "até-81k", label: "Até R$ 81 mil/ano" },
  { id: "81k-360k", label: "R$ 81 mil - R$ 360 mil/ano" },
  { id: "360k-4.8m", label: "R$ 360 mil - R$ 4,8 milhões/ano" },
  { id: "4.8m-78m", label: "R$ 4,8 milhões - R$ 78 milhões/ano" },
  { id: "acima-78m", label: "Acima de R$ 78 milhões/ano" },
]

// Aliases for backwards compatibility
export const COMPANY_TYPES = MOCK_COMPANY_TYPES
export const REVENUE_RANGES = MOCK_REVENUE_RANGES
