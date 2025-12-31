// // lib/workspace/limits.utils.ts
// // Pure helpers, types and constants (no "use server" here)

// import type { PlanLimits } from "@/domains/shared/db/types"

// export const PLAN_LIMITS: Record<string, PlanLimits> = {
//   plan_free: {
//     maxUsers: 1,
//     maxCustomers: 50,
//     maxProducts: 20,
//     maxInvoicesPerMonth: 50,
//     maxStorageMb: 100,
//     maxApiCallsPerDay: 100,
//   },
//   plan_pro: {
//     maxUsers: 10,
//     maxCustomers: 1000,
//     maxProducts: 500,
//     maxInvoicesPerMonth: 1000,
//     maxStorageMb: 5000,
//     maxApiCallsPerDay: 10000,
//   },
// }

// // ---------- Types ----------
// export interface LimitCheckResult {
//   allowed: boolean
//   current: number
//   limit: number
//   remaining: number
//   message?: string
// }

// export interface WorkspaceLimitsStatus {
//   users: LimitCheckResult
//   customers: LimitCheckResult
//   products: LimitCheckResult
//   invoices: LimitCheckResult
//   planId: string
//   planName: string
// }

// // ---------- Utils (pure) ----------

// /**
//  * Conversão defensiva do campo `count` (bigint | string | number | null | undefined)
//  */
// export function toNumber(value: unknown): number {
//   if (value === null || value === undefined) return 0
//   if (typeof value === "number" && Number.isFinite(value)) return value
//   if (typeof value === "bigint") return Number(value)
//   if (typeof value === "string") {
//     const parsed = parseInt(value, 10)
//     return Number.isFinite(parsed) ? parsed : 0
//   }
//   const maybe = Number((value as any) ?? 0)
//   return Number.isFinite(maybe) ? maybe : 0
// }

// /**
//  * Pega os limites do plano (fallback para plan_free)
//  */
// export function getPlanLimits(planId?: string): PlanLimits {
//   return (planId && PLAN_LIMITS[planId]) || PLAN_LIMITS.plan_free
// }

// /**
//  * Normaliza Partial<LimitCheckResult> para LimitCheckResult consistente
//  */
// export function normalizeCheck(input?: Partial<LimitCheckResult>): LimitCheckResult {
//   const current = Number.isFinite(input?.current as number) ? (input!.current as number) : 0
//   const limit = Number.isFinite(input?.limit as number) ? (input!.limit as number) : 0
//   const remaining = Math.max(0, limit - current)

//   const allowed =
//     typeof input?.allowed === "boolean"
//       ? input!.allowed!
//       : limit === 0
//       ? true
//       : current < limit

//   return {
//     allowed,
//     current,
//     limit,
//     remaining,
//     message: input?.message,
//   }
// }

// /**
//  * Formata mensagem do check (pt-BR)
//  */
// export function formatLimitMessage(rawCheck?: Partial<LimitCheckResult>): string {
//   const check = normalizeCheck(rawCheck)

//   if (check.limit === 0) {
//     return check.message || `Sem limite (${check.current})`
//   }

//   if (check.allowed) {
//     const plural = check.remaining === 1 ? "" : "s"
//     return `${check.current}/${check.limit} (${check.remaining} restante${plural})`
//   }

//   return check.message || `Limite atingido (${check.current}/${check.limit})`
// }

// /**
//  * Retorna true se o uso atual alcançou o threshold (0..1)
//  */
// export function isNearLimit(rawCheck?: Partial<LimitCheckResult>, threshold = 0.8): boolean {
//   if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) return false

//   const check = normalizeCheck(rawCheck)
//   if (check.limit <= 0) return false
//   const ratio = check.current / check.limit
//   return Number.isFinite(ratio) ? ratio >= threshold : false
// }

// /**
//  * Percentual (0-100) do uso do limite
//  */
// export function getLimitPercentage(rawCheck?: Partial<LimitCheckResult>): number {
//   const check = normalizeCheck(rawCheck)
//   if (check.limit <= 0) return 0
//   const rawPct = (check.current / check.limit) * 100
//   if (!Number.isFinite(rawPct)) return 0
//   const pct = Math.round(rawPct)
//   return Math.min(100, Math.max(0, pct))
// }
