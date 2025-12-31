import * as React from "react";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, trend }, ref) => {
    return (
      <Card ref={ref}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-muted-foreground mt-1 text-xs">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";

export interface DashboardOverviewProps
  extends React.HTMLAttributes<HTMLDivElement> {
  stats?: StatCardProps[];
}

const DashboardOverview = React.forwardRef<
  HTMLDivElement,
  DashboardOverviewProps
>(({ className, stats = [], ...props }, ref) => {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
});
DashboardOverview.displayName = "DashboardOverview";

export { DashboardOverview, StatCard };
