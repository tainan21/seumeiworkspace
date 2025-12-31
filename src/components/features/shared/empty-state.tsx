import * as React from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="bg-muted mb-4 rounded-full p-4">
            <Icon className="text-muted-foreground h-8 w-8" />
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
