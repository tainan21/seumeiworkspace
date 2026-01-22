"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Loader2, Users, ShoppingCart, Package, Brain, MessageSquare, Plus } from "lucide-react";
import { getFeatures, submitFeaturesStep } from "~/app/[locale]/[workspace]/onboarding/actions";
import { toast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";

// Map icons
const ICON_MAP: Record<string, any> = {
    Users,
    ShoppingCart,
    Package,
    Brain,
    MessageSquare,
};

interface FeaturesStepProps {
    workspaceId: string;
    onSuccess: () => void;
}

export default function FeaturesStep({ workspaceId, onSuccess }: FeaturesStepProps) {
    const [features, setFeatures] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const list = await getFeatures();
                setFeatures(list);
                // Pre-select CORE features by default
                const coreCodes = list
                    .filter((f: any) => f.category === "CORE")
                    .map((f: any) => f.code);
                setSelected(coreCodes);
            } catch (err) {
                console.error(err);
                toast({
                    title: "Erro ao carregar",
                    description: "Não foi possível carregar as funcionalidades.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const toggleFeature = (code: string) => {
        setSelected(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    async function handleSubmit() {
        setSubmitting(true);
        try {
            await submitFeaturesStep(workspaceId, selected);
            toast({
                title: "Funcionalidades ativadas!",
                description: "Você tem 7 dias de acesso completo gratuito.",
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível ativar as features.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    // Agrupar features
    const groups = features.reduce((acc, feat) => {
        const cat = feat.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(feat);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {(Object.entries(groups) as [string, any[]][]).map(([category, items]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        {category === "CORE" && "Essenciais"}
                        {category === "AI" && "Inteligência Artificial"}
                        {category === "AUTOMATION" && "Automação"}
                        {category === "UI" && "Interface"}
                        {category === "INTEGRATION" && "Integrações"}
                        {!["CORE", "AI", "AUTOMATION", "UI", "INTEGRATION"].includes(category) && category}
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((feat) => {
                            const Icon = ICON_MAP[feat.icon || ""] || Plus;
                            const isSelected = selected.includes(feat.code);

                            return (
                                <div
                                    key={feat.id}
                                    className={cn(
                                        "flex items-start space-x-4 rounded-lg border p-4 transition-all cursor-pointer",
                                        isSelected ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
                                    )}
                                    onClick={() => toggleFeature(feat.code)}
                                >
                                    <div className={cn("p-2 rounded-full", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium leading-none">{feat.name}</p>
                                            <Checkbox checked={isSelected} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {feat.description}
                                        </p>
                                        {feat.category !== "CORE" && (
                                            <p className="text-xs text-amber-600 font-medium pt-1">
                                                Trial de 7 dias
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-4 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t">
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    size="lg"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Ativando...
                        </>
                    ) : (
                        "Continuar para Produto"
                    )}
                </Button>
            </div>
        </div>
    );
}
