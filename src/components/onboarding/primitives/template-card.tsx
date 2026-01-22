"use client";

import { Check, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  supportedFeatures?: string[];
  targetCompanyTypes?: string[];
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
  className?: string;
}

/**
 * Card de template com preview e seleção
 */
export function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
  className,
}: TemplateCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        isSelected && "ring-2 ring-primary",
        className
      )}
      onClick={onSelect}
    >
      <CardHeader>
        {template.thumbnail ? (
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4">
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg bg-muted mb-4 flex items-center justify-center">
            <span className="text-muted-foreground">Sem preview</span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {template.name}
              {isSelected && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {template.supportedFeatures && (
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {template.supportedFeatures.length} recursos incluídos
              </p>
            </div>
          )}
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
