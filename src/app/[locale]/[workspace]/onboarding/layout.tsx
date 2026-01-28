import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

/**
 * Layout para onboarding inicial (sem workspace)
 * Layout limpo sem sidebar/header do workspace
 */
export default function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
