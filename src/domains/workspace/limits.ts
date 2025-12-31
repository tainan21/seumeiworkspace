// lib/workspace/limits.ts
// Facade: re-exporta utilitários puros para uso em client/shared code.
// NÃO re-exporta automaticamente as funções server — importe-as diretamente
// de "lib/workspace/limits.server" quando estiver em Server Components/Actions.

// export * from "./limits.utils"
export * from "./limits.server";

// --- USO (exemplo / instrução):
// Em Server Components / Server Actions:
//   import { getWorkspaceLimitsStatus } from "@/lib/workspace/limits.server"
//
// Em componentes cliente / utilitários compartilhados:
//   import { formatLimitMessage, isNearLimit, getLimitPercentage } from "@/lib/workspace/limits"
