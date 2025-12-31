import * as React from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "list" | "table";
  count?: number;
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, variant = "card", count = 3, ...props }, ref) => {
    if (variant === "card") {
      return (
        <div
          ref={ref}
          className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
          {...props}
        >
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (variant === "list") {
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (variant === "table") {
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }
);
LoadingState.displayName = "LoadingState";

export { LoadingState };
