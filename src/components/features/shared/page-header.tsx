import * as React from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => {
    const ActionIcon = action?.icon;

    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between", className)}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick}>
            {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
