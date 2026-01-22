"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface FeatureFlagsContextValue {
  flags: Record<string, boolean>;
  isEnabled: (flag: string) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(
  null
);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  flags: Record<string, boolean>;
}

/**
 * Provider de feature flags
 */
export function FeatureFlagsProvider({
  children,
  flags,
}: FeatureFlagsProviderProps) {
  const isEnabled = (flag: string): boolean => {
    return flags[flag] ?? false;
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook para usar feature flags
 */
export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);

  if (!context) {
    // Retornar valores padrão se não estiver em provider
    return {
      flags: {},
      isEnabled: () => false,
    };
  }

  return context;
}
