// ============================================
// ANALYTICS TYPES - Tipos para analytics infrastructure
// ============================================

/**
 * Tipos de eventos de analytics
 */
export type AnalyticsEventType =
  | "page_view"
  | "page_interaction"
  | "feature_usage"
  | "navigation"
  | "search"
  | "error"
  | "custom"

/**
 * Períodos de agregação
 */
export type AnalyticsAggregationPeriod = "hourly" | "daily" | "weekly" | "monthly"

/**
 * Tipo de dispositivo
 */
export type DeviceType = "desktop" | "mobile" | "tablet"

/**
 * Evento de analytics
 */
export interface AnalyticsEvent {
  id: string
  workspaceId: string
  userId?: string
  sessionId?: string
  eventType: AnalyticsEventType
  eventName: string
  pageId?: string
  pageSlug?: string
  featureId?: string
  properties: Record<string, unknown>
  userAgent?: string
  ipHash?: string
  referrer?: string
  deviceType?: DeviceType
  browser?: string
  os?: string
  countryCode?: string
  occurredAt: string
  receivedAt: string
}

/**
 * Input para criar evento de analytics
 */
export interface CreateAnalyticsEventInput {
  workspaceId: string
  userId?: string
  sessionId?: string
  eventType: AnalyticsEventType
  eventName: string
  pageId?: string
  pageSlug?: string
  featureId?: string
  properties?: Record<string, unknown>
  occurredAt?: string
}

/**
 * Agregação de analytics
 */
export interface AnalyticsAggregation {
  id: string
  workspaceId: string
  period: AnalyticsAggregationPeriod
  periodStart: string
  periodEnd: string
  totalPageViews: number
  uniqueVisitors: number
  uniqueSessions: number
  totalEvents: number
  eventsByType: Record<AnalyticsEventType, number>
  topPages: Array<{ pageId: string; pageSlug: string; views: number }>
  topFeatures: Array<{ featureId: string; usageCount: number }>
  calculatedAt: string
}

/**
 * Contador de page views
 */
export interface PageViewCounter {
  id: string
  workspaceId: string
  pageId: string
  pageSlug: string
  viewCountTotal: number
  viewCountToday: number
  viewCountWeek: number
  viewCountMonth: number
  lastDailyReset: string
  lastWeeklyReset: string
  lastMonthlyReset: string
  createdAt: string
  updatedAt: string
}

/**
 * Configuração de analytics do workspace
 */
export interface WorkspaceAnalyticsConfig {
  id: string
  workspaceId: string
  isEnabled: boolean
  trackPageViews: boolean
  trackFeatureUsage: boolean
  trackNavigation: boolean
  trackSearches: boolean
  trackErrors: boolean
  retentionDays: number
  anonymizeIp: boolean
  respectDnt: boolean
  customEventsEnabled: boolean
  customEventsLimit: number
  createdAt: string
  updatedAt: string
}

/**
 * Resultado de validação de evento
 */
export interface AnalyticsEventValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Input para tracking de page view (simplificado)
 */
export interface TrackPageViewInput {
  workspaceId: string
  pageId: string
  pageSlug: string
  userId?: string
  sessionId?: string
  referrer?: string
}

/**
 * Resultado de operação de tracking
 */
export type TrackingResult = { success: true; eventId: string } | { success: false; error: string }
