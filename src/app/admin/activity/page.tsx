import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { requireAdmin } from "~/domains/admin/middleware/admin.middleware";
import {
  getAllActivityLogs,
  getActivityLogsStats,
} from "~/domains/admin/actions/activity-admin.actions";
import { AdminActivityLogsTable } from "~/components/admin/activity-logs-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Activity, TrendingUp, Calendar, Users } from "lucide-react";

export const metadata = {
  title: "Activity Logs - Admin",
  description: "Visualize todos os logs de atividades do sistema",
};

export default async function AdminActivityPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");

  // Validação de admin
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/unauthorized");
  }

  // Buscar dados em paralelo
  const [logs, stats] = await Promise.all([
    getAllActivityLogs({ limit: 100, offset: 0 }),
    getActivityLogsStats(),
  ]);

  return (
    <div className="mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">
          Visualize e monitore todos os logs de atividades do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Desde o início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logsToday.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Atividades hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logsThisWeek.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logsThisMonth.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminActivityLogsTable initialLogs={logs} stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}

