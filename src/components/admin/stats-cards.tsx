import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { GlobalStats } from "~/domains/admin/types";
import {
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  Archive,
} from "lucide-react";

interface AdminStatsCardsProps {
  stats: GlobalStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Workspaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Workspaces
          </CardTitle>
          <Building2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkspaces}</div>
          <p className="text-muted-foreground text-xs">
            {stats.activeWorkspaces} ativos, {stats.suspendedWorkspaces}{" "}
            suspensos
          </p>
        </CardContent>
      </Card>

      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-muted-foreground text-xs">
            {stats.totalMembers} membros em workspaces
          </p>
        </CardContent>
      </Card>

      {/* Active Workspaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Workspaces Ativos
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.activeWorkspaces}
          </div>
          <p className="text-muted-foreground text-xs">
            {stats.archivedWorkspaces} arquivados
          </p>
        </CardContent>
      </Card>

      {/* Suspended Workspaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.suspendedWorkspaces}
          </div>
          <p className="text-muted-foreground text-xs">Requerem atenção</p>
        </CardContent>
      </Card>

      {/* Workspaces by Plan */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Workspaces por Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-sm">
              Free: {stats.workspacesByPlan.free}
            </Badge>
            <Badge variant="default" className="text-sm">
              Pro: {stats.workspacesByPlan.pro}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Enterprise: {stats.workspacesByPlan.enterprise}
            </Badge>
            <Badge variant="destructive" className="text-sm">
              Sem Plano: {stats.workspacesByPlan.none}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Workspaces by Category */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Workspaces por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.workspacesByCategory).map(
              ([category, count]) =>
                count > 0 && (
                  <Badge key={category} variant="outline" className="text-sm">
                    {category}: {count}
                  </Badge>
                )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
