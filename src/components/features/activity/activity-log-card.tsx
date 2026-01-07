"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { 
  FolderPlus, 
  FolderEdit, 
  FolderX, 
  UserPlus, 
  UserMinus, 
  UserCog,
  Settings,
  CreditCard,
  Wallet,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ActivityLogDisplay } from "~/domains/workspace/activity.types";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface ActivityLogCardProps {
  log: ActivityLogDisplay;
  showTimeline?: boolean;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  PROJECT_CREATED: FolderPlus,
  PROJECT_UPDATED: FolderEdit,
  PROJECT_DELETED: FolderX,
  MEMBER_INVITED: UserPlus,
  MEMBER_JOINED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  MEMBER_ROLE_CHANGED: UserCog,
  SETTINGS_UPDATED: Settings,
  WORKSPACE_UPDATED: Settings,
  SUBSCRIPTION_CREATED: CreditCard,
  SUBSCRIPTION_UPDATED: CreditCard,
  SUBSCRIPTION_CANCELLED: CreditCard,
  WALLET_CREDIT_ADDED: Wallet,
  WALLET_CREDIT_USED: Wallet,
};

const ACTION_COLORS: Record<string, string> = {
  PROJECT_CREATED: "text-green-600 bg-green-50 dark:bg-green-950",
  PROJECT_UPDATED: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  PROJECT_DELETED: "text-red-600 bg-red-50 dark:bg-red-950",
  MEMBER_INVITED: "text-green-600 bg-green-50 dark:bg-green-950",
  MEMBER_JOINED: "text-green-600 bg-green-50 dark:bg-green-950",
  MEMBER_REMOVED: "text-red-600 bg-red-50 dark:bg-red-950",
  MEMBER_ROLE_CHANGED: "text-orange-600 bg-orange-50 dark:bg-orange-950",
  SETTINGS_UPDATED: "text-purple-600 bg-purple-50 dark:bg-purple-950",
  WORKSPACE_UPDATED: "text-purple-600 bg-purple-50 dark:bg-purple-950",
  SUBSCRIPTION_CREATED: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
  SUBSCRIPTION_UPDATED: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
  SUBSCRIPTION_CANCELLED: "text-red-600 bg-red-50 dark:bg-red-950",
  WALLET_CREDIT_ADDED: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  WALLET_CREDIT_USED: "text-amber-600 bg-amber-50 dark:bg-amber-950",
};

export function ActivityLogCard({ log, showTimeline = true }: ActivityLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = ACTION_ICONS[log.action] || Activity;
  const colorClass = ACTION_COLORS[log.action] || "text-gray-600 bg-gray-50 dark:bg-gray-950";
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {showTimeline && (
        <div className="relative flex flex-col items-center">
          <div className={cn("rounded-full p-2", colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="bg-border mt-2 h-full w-px" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="border-border hover:bg-accent/50 rounded-lg border p-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {/* Message */}
              <p className="font-medium">{log.formattedMessage}</p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
                <span>
                  {format(log.timestamp, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
                {log.userEmail && (
                  <>
                    <span>•</span>
                    <span>{log.userEmail}</span>
                  </>
                )}
                {log.entityId && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {log.entityType}
                    </Badge>
                  </>
                )}
              </div>

              {/* Metadata expansion */}
              {hasMetadata && (
                <div className="mt-3">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Ocultar detalhes
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Ver detalhes
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="bg-muted mt-2 rounded-md p-3">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

