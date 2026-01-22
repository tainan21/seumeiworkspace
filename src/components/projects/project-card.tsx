"use client";

import Link from "next/link";
import { FolderKanban, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Project } from "@prisma/client";
import { cn } from "~/lib/utils";

interface ProjectCardProps {
  project: Project;
  workspaceSlug: string;
  className?: string;
}

/**
 * Card de projeto para exibição em grid
 */
export function ProjectCard({
  project,
  workspaceSlug,
  className,
}: ProjectCardProps) {
  return (
    <Link href={`/${workspaceSlug}/projects/${project.id}`}>
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer h-full",
          className
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.domain}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(project.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
