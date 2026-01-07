import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { prisma } from "~/lib/server/db";
import { getActivityLogs } from "~/domains/workspace/actions/activity.actions";
import { ActivityLogList } from "~/components/features/activity/activity-log-list";
import { PageHeader } from "~/components/features/shared";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Log de Atividades",
  description: "Visualize as ações importantes realizadas no workspace",
};

/**
 * Busca o primeiro workspace do usuário
 */
async function getUserFirstWorkspace(userId: string) {
  const membership = await (prisma as any).workspaceMember.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return membership?.workspace || null;
}

/**
 * Conta total de logs do workspace
 */
async function getWorkspaceLogsCount(workspaceId: string): Promise<number> {
  try {
    return await (prisma as any).auditLog.count({
      where: { workspaceId },
    });
  } catch (error) {
    console.error("[getWorkspaceLogsCount] Error:", error);
    return 0;
  }
}

export default async function ActivityPage() {
  const { user } = await getCurrentSession();

  if (!user?.id) {
    redirect("/login");
  }

  // Buscar o primeiro workspace do usuário
  const workspace = await getUserFirstWorkspace(user.id);

  if (!workspace) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Log de Atividades"
          description="Visualize as ações importantes realizadas no workspace"
        />
        <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <Activity className="text-muted-foreground h-8 w-8" />
          </div>
          <p className="font-medium">Você não possui nenhum workspace ainda.</p>
          <p className="mt-2 text-sm">
            Crie um workspace para começar a ver os logs de atividades.
          </p>
        </div>
      </div>
    );
  }

  // Buscar logs e total em paralelo
  let logs: Awaited<ReturnType<typeof getActivityLogs>> = [];
  let totalLogs = 0;
  
  try {
    [logs, totalLogs] = await Promise.all([
      getActivityLogs(workspace.id, { limit: 50 }),
      getWorkspaceLogsCount(workspace.id),
    ]);
  } catch (error) {
    console.error("[ActivityPage] Error fetching logs:", error);
    logs = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log de Atividades"
        description={`Workspace: ${workspace.name}`}
      />
      
      {/* Contador de logs */}
      <div className="text-muted-foreground text-sm">
        Mostrando {logs.length} de {totalLogs.toLocaleString()} atividades
      </div>

      <ActivityLogList 
        logs={logs} 
        workspaceId={workspace.id}
        totalLogs={totalLogs}
      />
    </div>
  );
}

