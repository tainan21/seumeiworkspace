"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import type {
  AdminActivityLogsResponse,
  AdminActivityStats,
} from "~/domains/admin/types";
import { Activity, Search, Filter } from "lucide-react";
import { ACTIVITY_ACTION_LABELS } from "~/domains/workspace/activity.constants";

interface AdminActivityLogsTableProps {
  initialLogs: AdminActivityLogsResponse;
  stats: AdminActivityStats;
}

export function AdminActivityLogsTable({
  initialLogs,
  stats,
}: AdminActivityLogsTableProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [logs] = useState(initialLogs.logs);

  // Filtrar logs
  const filteredLogs = logs.filter((log) => {
    // Filtro de busca (email ou workspace)
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesEmail = log.userEmail?.toLowerCase().includes(searchLower);
      const matchesWorkspace = log.workspaceName?.toLowerCase().includes(searchLower);
      if (!matchesEmail && !matchesWorkspace) return false;
    }

    // Filtro de ação
    if (actionFilter !== "all" && log.action !== actionFilter) {
      return false;
    }

    return true;
  });

  // Obter ações únicas para o filtro
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action))).sort();

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PROJECT_CREATED: "default",
      PROJECT_UPDATED: "secondary",
      PROJECT_DELETED: "destructive",
      MEMBER_INVITED: "default",
      MEMBER_REMOVED: "destructive",
      MEMBER_ROLE_CHANGED: "outline",
      SETTINGS_UPDATED: "secondary",
      WORKSPACE_UPDATED: "secondary",
      SUBSCRIPTION_CREATED: "default",
      SUBSCRIPTION_CANCELLED: "destructive",
      WALLET_CREDIT_ADDED: "default",
      WALLET_CREDIT_USED: "secondary",
    };

    const variant = variants[action] || "outline";
    const label = ACTIVITY_ACTION_LABELS[action] || action;

    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por email ou workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {ACTIVITY_ACTION_LABELS[action] || action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(search || actionFilter !== "all") && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setActionFilter("all");
            }}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Contador */}
      <div className="text-muted-foreground text-sm">
        Mostrando {filteredLogs.length} de {logs.length} logs
        {initialLogs.total > logs.length && ` (${initialLogs.total} no total)`}
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Data/Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="h-8 w-8 opacity-50" />
                    <p>Nenhum log encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.workspaceName || "N/A"}
                      </div>
                      {log.workspaceId && (
                        <div className="text-muted-foreground text-xs">
                          {log.workspaceId.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.userName || "Desconhecido"}
                      </div>
                      {log.userEmail && (
                        <div className="text-muted-foreground text-xs">
                          {log.userEmail}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{log.entityType}</div>
                      {log.entityId && (
                        <div className="text-muted-foreground text-xs">
                          {log.entityId.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* TODO: Adicionar paginação real quando necessário */}
      {/* TODO: Adicionar export para CSV */}
    </div>
  );
}

