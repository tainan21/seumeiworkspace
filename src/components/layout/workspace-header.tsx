"use client";

import Link from "next/link";
import { useWorkspace } from "~/lib/hooks/useWorkspace";
import { Settings, Users, Building2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

interface WorkspaceHeaderProps {
  workspaceName: string;
  workspaceSlug: string;
}

/**
 * Header do workspace
 * Exibe informações do workspace e menu de ações
 */
export function WorkspaceHeader({
  workspaceName,
  workspaceSlug,
}: WorkspaceHeaderProps) {
  const { role, canManage, isAdmin } = useWorkspace();

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${workspaceSlug}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Building2 className="h-5 w-5" />
            <div>
              <div className="text-lg font-semibold">{workspaceName}</div>
              <div className="text-muted-foreground text-xs">/{workspaceSlug}</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Menu de ações baseado em permissões */}
          {canManage && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${workspaceSlug}/settings/team`}>
                  <Users className="h-4 w-4 mr-2" />
                  Membros
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${workspaceSlug}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações Gerais
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/${workspaceSlug}/settings/billing`}>
                          <Building2 className="h-4 w-4 mr-2" />
                          Assinatura
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${workspaceSlug}/settings/team`}>
                          <Users className="h-4 w-4 mr-2" />
                          Equipe
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Breadcrumbs serão adicionados dinamicamente baseado na rota */}
        </div>
      </div>
    </header>
  );
}
