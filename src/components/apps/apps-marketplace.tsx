"use client";

import { useState } from "react";
import { Check, Package, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Feature } from "@prisma/client";
import { FeatureCategory } from "@prisma/client";
import { activateFeatureAction, purchaseFeatureAction } from "./actions";
import { toast } from "~/hooks/use-toast";

interface AppsMarketplaceProps {
  workspaceId: string;
  availableFeatures: Feature[];
  activeFeatureCodes: Set<string>;
  canWrite: boolean;
}

/**
 * Marketplace de apps com listagem e ativação
 */
export function AppsMarketplace({
  workspaceId,
  availableFeatures,
  activeFeatureCodes,
  canWrite,
}: AppsMarketplaceProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | "ALL">("ALL");
  const [activating, setActivating] = useState<Set<string>>(new Set());

  const categories: Array<{ value: FeatureCategory | "ALL"; label: string }> = [
    { value: "ALL", label: "Todos" },
    { value: "CORE", label: "Core" },
    { value: "AI", label: "IA" },
    { value: "AUTOMATION", label: "Automação" },
    { value: "UI", label: "UI" },
    { value: "INTEGRATION", label: "Integrações" },
  ];

  const filteredFeatures = availableFeatures.filter((feature) => {
    const matchesSearch =
      !search ||
      feature.name.toLowerCase().includes(search.toLowerCase()) ||
      feature.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActivate = async (featureCode: string) => {
    setActivating((prev) => new Set(prev).add(featureCode));

    try {
      const result = await activateFeatureAction(workspaceId, featureCode);

      if (result.success) {
        toast({
          title: "Feature ativada",
          description: `${featureCode} foi ativada com sucesso.`,
        });
        // Recarregar página para atualizar lista
        window.location.reload();
      } else {
        throw new Error(result.error || "Erro ao ativar feature");
      }
    } catch (error) {
      console.error("[AppsMarketplace] Error:", error);
      toast({
        title: "Erro ao ativar feature",
        description:
          error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setActivating((prev) => {
        const next = new Set(prev);
        next.delete(featureCode);
        return next;
      });
    }
  };

  const handlePurchase = async (featureCode: string, price: number) => {
    setActivating((prev) => new Set(prev).add(featureCode));

    try {
      const result = await purchaseFeatureAction(workspaceId, featureCode, price);

      if (result.success) {
        toast({
          title: "Feature comprada e ativada",
          description: `${featureCode} foi comprada e ativada com sucesso.`,
        });
        window.location.reload();
      } else {
        throw new Error(result.error || "Erro ao comprar feature");
      }
    } catch (error) {
      console.error("[AppsMarketplace] Error:", error);
      toast({
        title: "Erro ao comprar feature",
        description:
          error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setActivating((prev) => {
        const next = new Set(prev);
        next.delete(featureCode);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FeatureCategory | "ALL")}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de Apps */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum app encontrado com os filtros selecionados
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => {
            const isActive = activeFeatureCodes.has(feature.code);
            const isActivating = activating.has(feature.code);

            return (
              <Card key={feature.id} className="relative">
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">
                      <Check className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start gap-3">
                    {feature.icon ? (
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-muted">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {feature.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {feature.description && (
                    <CardDescription>{feature.description}</CardDescription>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    {isActive ? (
                      <Button variant="outline" disabled>
                        Já Ativo
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleActivate(feature.code)}
                        disabled={!canWrite || isActivating}
                      >
                        {isActivating ? (
                          "Ativando..."
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
