"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";
import type { ActivityLogDisplay } from "~/domains/workspace/activity.types";
import { EmptyState } from "~/components/features/shared";
import { ActivityLogCard } from "./activity-log-card";
import { ActivityLogFilters, type ActivityFilters } from "./activity-log-filters";
import { ACTION_TO_CATEGORY } from "~/domains/workspace/activity.constants";

interface ActivityLogListProps {
  logs: ActivityLogDisplay[];
  workspaceId?: string;
  totalLogs?: number;
}

export function ActivityLogList({ logs, workspaceId, totalLogs }: ActivityLogListProps) {
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    action: "all",
    category: "all",
    dateRange: "all",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtrar logs
  const filteredLogs = logs.filter((log) => {
    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesMessage = log.formattedMessage.toLowerCase().includes(searchLower);
      const matchesEmail = log.userEmail?.toLowerCase().includes(searchLower);
      if (!matchesMessage && !matchesEmail) return false;
    }

    // Filtro de categoria
    if (filters.category !== "all") {
      const logCategory = ACTION_TO_CATEGORY[log.action];
      if (logCategory !== filters.category) return false;
    }

    // Filtro de ação
    if (filters.action !== "all" && log.action !== filters.action) {
      return false;
    }

    // Filtro de data
    if (filters.dateRange !== "all") {
      const now = new Date();
      const logDate = new Date(log.timestamp);
      
      if (filters.dateRange === "today") {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (logDate < startOfToday) return false;
      } else if (filters.dateRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        if (logDate < weekAgo) return false;
      } else if (filters.dateRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        if (logDate < monthAgo) return false;
      }
    }

    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Recarregar a página para buscar novos logs
    window.location.reload();
  };

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhum log de atividade encontrado"
        description="As ações importantes do workspace aparecerão aqui"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Log de Atividades
            </CardTitle>
            <CardDescription>
              {filteredLogs.length === logs.length
                ? `${logs.length} atividades recentes`
                : `${filteredLogs.length} de ${logs.length} atividades`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <ActivityLogFilters onFiltersChange={setFilters} />

        {/* Lista de logs */}
        {filteredLogs.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <p>Nenhum log encontrado com os filtros aplicados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log, index) => (
              <ActivityLogCard
                key={log.id}
                log={log}
                showTimeline={index < filteredLogs.length - 1}
              />
            ))}
          </div>
        )}

        {/* TODO: Implementar scroll infinito para carregar mais logs */}
        {filteredLogs.length >= 50 && totalLogs && totalLogs > 50 && (
          <div className="text-muted-foreground pt-4 text-center text-sm">
            Mostrando primeiros 50 logs. Total: {totalLogs.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

