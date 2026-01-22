"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, Truck, User, Store, ShoppingBag, Wrench, Hammer, LayoutGrid } from "lucide-react";
import { submitCategoryStep } from "~/app/[locale]/[workspace]/onboarding/actions";
import { toast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";

interface CategoryOption {
    id: string;
    label: string;
    description: string;
    icon: any;
}

const CATEGORIES: CategoryOption[] = [
    {
        id: "DELIVERY",
        label: "Delivery",
        description: "Restaurantes, lanchonetes e entregas",
        icon: Truck
    },
    {
        id: "AUTONOMO",
        label: "Autônomo",
        description: "Prestadores de serviços individuais",
        icon: User
    },
    {
        id: "COMERCIO",
        label: "Comércio",
        description: "Pequenos comércios e mercearias",
        icon: Store
    },
    {
        id: "LOJA",
        label: "Loja Virtual",
        description: "Venda de produtos online",
        icon: ShoppingBag
    },
    {
        id: "SERVICOS",
        label: "Serviços",
        description: "Salões, oficinas e assistência",
        icon: Wrench
    },
    {
        id: "CONSTRUCAO",
        label: "Construção",
        description: "Obras, reformas e materiais",
        icon: Hammer
    },
    {
        id: "LIVRE",
        label: "Outro",
        description: "Configuração livre",
        icon: LayoutGrid
    },
];

interface CategoryStepProps {
    workspaceId: string;
    onSuccess: () => void;
}

export default function CategoryStep({ workspaceId, onSuccess }: CategoryStepProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!selected) return;

        setLoading(true);
        try {
            await submitCategoryStep(workspaceId, selected);
            toast({
                title: "Categoria salva!",
                description: "Vamos personalizar seu sistema.",
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar a categoria.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selected === category.id;

                    return (
                        <div
                            key={category.id}
                            onClick={() => setSelected(category.id)}
                            className={cn(
                                "cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-accent",
                                isSelected
                                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                                    : "border-muted bg-card hover:border-primary/50"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                    "p-2 rounded-full",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold">{category.label}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {category.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={!selected || loading}
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Continuar para Aparência"
                    )}
                </Button>
            </div>
        </div>
    );
}
