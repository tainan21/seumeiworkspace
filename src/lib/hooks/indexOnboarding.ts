// ============================================
// HOOKS: Re-export all custom hooks
// Centralized export for easier imports
// ============================================

// API hooks
export { useApiCall, useApiState } from "./use-api-call"

// Accessibility hooks
export { useReducedMotion } from "./use-reduced-motion"

// Workspace hooks
export { useWorkspaceLayout, WorkspaceLayoutProvider } from "./use-workspace-layout"
export { useWorkspaceSession, WorkspaceProvider } from "./useWorkspaceSession"

// Component config hooks - re-exported from store
export {
  useSidebarConfig,
  useTopbarConfig,
  useDashboardConfig,
  useFontsConfig,
  useTailwindConfig,
  useSlotsConfig,
  useThemeConfig,
  useColorsConfig,
  useConfigHistory,
  useConfigStatus,
  useLayoutPresets,
} from "@/lib/stores/component-config-store"
