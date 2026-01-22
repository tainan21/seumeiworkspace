"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface UploaderProps {
  accept?: string;
  maxSize?: number; // em MB
  value?: string; // URL ou base64
  onUpload: (file: File) => Promise<string> | string;
  onRemove?: () => void;
  className?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

/**
 * Componente de upload de arquivo
 * Suporta preview de imagem e estados de loading
 */
export function Uploader({
  accept = "image/*",
  maxSize = 5,
  value,
  onUpload,
  onRemove,
  className,
}: UploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      setState("error");
      return;
    }

    setState("uploading");
    setError(null);

    try {
      // Por enquanto, criar URL local (mock)
      // Em produção, fazer upload real
      const url = URL.createObjectURL(file);
      await onUpload(file);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload");
      setState("error");
    }
  };

  const handleRemove = () => {
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onRemove?.();
    setState("idle");
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg border-2 border-dashed border-muted overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                type="button"
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            state === "uploading"
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-primary/50",
            className
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={state === "uploading"}
          />
          {state === "uploading" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para fazer upload
              </span>
              <span className="text-xs text-muted-foreground">
                Máximo {maxSize}MB
              </span>
            </div>
          )}
        </label>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
