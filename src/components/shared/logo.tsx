/**
 * SEUMEI Logo Component
 * Brand identity component
 */

import { cn } from "~/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
  xl: { icon: 48, text: "text-3xl" },
};

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  const IconMark = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Hexagon base */}
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        fill="currentColor"
        className="text-foreground"
      />
      {/* Inner S mark */}
      <path
        d="M30 18C30 18 28 16 24 16C20 16 18 18 18 20C18 22 20 23 24 24C28 25 30 26 30 28C30 30 28 32 24 32C20 32 18 30 18 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-background"
      />
    </svg>
  );

  const TextMark = () => (
    <span className={cn("font-mono font-semibold tracking-tight", textSize)}>
      SEUMEI
    </span>
  );

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center", className)}>
        <IconMark />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("flex items-center", className)}>
        <TextMark />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconMark />
      <TextMark />
    </div>
  );
}
