"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error para monitoramento
    console.error("[WorkspaceError] Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            <CardTitle>Algo deu errado</CardTitle>
          </div>
          <CardDescription>
            Não foi possível carregar o workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="bg-muted rounded-md p-3">
              <p className="text-muted-foreground font-mono text-sm">
                {error.message}
              </p>
            </div>
          )}
          <Button onClick={reset} className="w-full">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
