"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type {
  WorkspacesResponse,
  WorkspaceWithDetails,
} from "~/domains/admin/types";
import { Building2, Users, Wallet, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminWorkspacesTableProps {
  initialWorkspaces: WorkspacesResponse;
}

export function AdminWorkspacesTable({
  initialWorkspaces,
}: AdminWorkspacesTableProps) {
  const [search, setSearch] = useState("");
  const [workspaces] = useState(initialWorkspaces.workspaces);

  const filteredWorkspaces = workspaces.filter((ws) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      ws.name.toLowerCase().includes(searchLower) ||
      ws.slug.toLowerCase().includes(searchLower) ||
      ws.enterpriseMother?.tradeName.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-600">Ativo</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspenso</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {category}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por nome, slug ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Membros</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkspaces.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-muted-foreground text-center"
                >
                  Nenhum workspace encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {workspace.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {workspace.enterpriseMother ? (
                      <div>
                        <div className="font-medium">
                          {workspace.enterpriseMother.tradeName}
                        </div>
                        {workspace.enterpriseMother.document && (
                          <div className="text-muted-foreground text-sm">
                            {workspace.enterpriseMother.document}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(workspace.status)}</TableCell>
                  <TableCell>{getCategoryBadge(workspace.category)}</TableCell>
                  <TableCell>
                    {workspace.subscription ? (
                      <Badge variant="default">
                        {workspace.subscription.plan.name}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Sem plano</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="text-muted-foreground h-4 w-4" />
                      {workspace._count.members}
                    </div>
                  </TableCell>
                  <TableCell>
                    {workspace.wallet ? (
                      <div className="flex items-center gap-1">
                        <Wallet className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">
                          {Number(workspace.wallet.balance).toFixed(0)}{" "}
                          {workspace.wallet.currency}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(workspace.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/workspaces/${workspace.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="text-muted-foreground text-sm">
        Mostrando {filteredWorkspaces.length} de {initialWorkspaces.total}{" "}
        workspaces
      </div>
    </div>
  );
}
