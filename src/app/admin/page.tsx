import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { requireAdmin } from "~/domains/admin/middleware/admin.middleware";
import {
  getGlobalStatsAction,
  listAllWorkspacesAction,
} from "~/domains/admin/actions/admin.actions";
import { AdminStatsCards } from "~/components/admin/stats-cards";
import { AdminWorkspacesTable } from "~/components/admin/workspaces-table";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default async function AdminDashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");

  // Validação de admin
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/unauthorized");
  }

  // Busca dados em paralelo
  const [stats, workspaces] = await Promise.all([
    getGlobalStatsAction(),
    listAllWorkspacesAction({ limit: 20, page: 0 }),
  ]);

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral de todos os workspaces e estatísticas do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <AdminStatsCards stats={stats} />
      </Suspense>

      {/* Workspaces Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>
            Lista de todos os workspaces cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<WorkspacesTableSkeleton />}>
            <AdminWorkspacesTable initialWorkspaces={workspaces} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-1 h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WorkspacesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
