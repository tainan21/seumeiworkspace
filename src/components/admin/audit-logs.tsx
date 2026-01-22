"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getAuditLogsAction } from "./actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLogsProps {
  workspaceId?: string;
}

/**
 * Componente para visualizar logs de auditoria
 */
export function AuditLogs({ workspaceId }: AuditLogsProps) {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await getAuditLogsAction({
        workspaceId,
        search,
      });
      setLogs(result.events || []);
    } catch (error) {
      console.error("[AuditLogs] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {loading ? "Carregando..." : "Nenhum log encontrado"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {log.user?.name || log.user?.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{log.eventType}</span>
                  </TableCell>
                  <TableCell>
                    {log.entityType && (
                      <span className="text-sm text-muted-foreground">
                        {log.entityType}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.properties && Object.keys(log.properties).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(log.properties, null, 2)}
                        </pre>
                      </details>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
