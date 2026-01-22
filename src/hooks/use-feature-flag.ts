"use client";

import { useFeatureFlags } from "~/lib/feature-flags/provider";

/**
 * Hook para verificar se feature flag está ativa
 * 
 * @param flag - Nome da feature flag
 * @returns true se flag está ativa
 * 
 * @example
 * ```tsx
 * const { isEnabled } = useFeatureFlag();
 * if (isEnabled("new-onboarding")) {
 *   return <NewOnboarding />;
 * }
 * ```
 */
export function useFeatureFlag(flag: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}
