import type { CompanyType } from "~/types/workspace-onboarding";

export const MOCK_COMPANY_TYPES: { value: CompanyType; label: string; description: string }[] = [
  {
    value: "MEI",
    label: "MEI (Microempreendedor Individual)",
    description: "Ideal para profissionais autônomos e pequenos negócios",
  },
  {
    value: "Simples",
    label: "Simples Nacional",
    description: "Para empresas com faturamento até R$ 4,8 milhões/ano",
  },
  {
    value: "EIRELI",
    label: "EIRELI",
    description: "Empresa Individual de Responsabilidade Limitada",
  },
  {
    value: "Ltda",
    label: "Ltda (Sociedade Limitada)",
    description: "Para empresas com sócios e maior estrutura",
  },
  {
    value: "SA",
    label: "SA (Sociedade Anônima)",
    description: "Para grandes empresas e capital aberto",
  },
  {
    value: "Startup",
    label: "Startup",
    description: "Empresa de tecnologia em fase de crescimento",
  },
];

export const MOCK_REVENUE_RANGES = [
  { value: "0-50k", label: "Até R$ 50.000/ano" },
  { value: "50k-200k", label: "R$ 50.000 - R$ 200.000/ano" },
  { value: "200k-500k", label: "R$ 200.000 - R$ 500.000/ano" },
  { value: "500k-1M", label: "R$ 500.000 - R$ 1.000.000/ano" },
  { value: "1M-5M", label: "R$ 1.000.000 - R$ 5.000.000/ano" },
  { value: "5M+", label: "Acima de R$ 5.000.000/ano" },
];
