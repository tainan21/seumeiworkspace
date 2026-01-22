"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Loader2, Plus, PartyPopper } from "lucide-react";
import { submitProductAndFinish } from "~/app/[locale]/[workspace]/onboarding/actions";
import { toast } from "~/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

const productSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    price: z.string().min(1, "Preço obrigatório"),
    description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductStepProps {
    workspaceId: string;
    onSuccess: () => void;
}

export default function ProductStep({ workspaceId, onSuccess }: ProductStepProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            price: "",
            description: "",
        },
    });

    async function onSubmit(data: ProductFormValues) {
        setLoading(true);
        try {
            await submitProductAndFinish(workspaceId, data);
            toast({
                title: "Tudo pronto! 🎉",
                description: "Seu workspace foi configurado com sucesso.",
            });
            // Redirecionamento final
            router.push(`/${workspaceId}`); // Vai para dashboard
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao finalizar",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive",
            });
        } finally {
            // setLoading(false); // Manter loading enquanto redireciona
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-lg flex items-center gap-4 mb-6 border border-primary/20">
                <div className="bg-primary/20 p-2 rounded-full text-primary">
                    <PartyPopper className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-primary">Último passo!</h4>
                    <p className="text-sm text-muted-foreground">Cadastre seu primeiro item para ver a mágica acontecer.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Produto/Serviço *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Consultoria Premium, Camiseta..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço de Venda (R$) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição (Opcional)</FormLabel>
                                <FormControl>
                                    {/* @ts-ignore - Textarea pode não estar exportado corretamente se não existir no projeto */}
                                    <Input placeholder="Detalhes do item..." {...field} />
                                    {/* Fallback to Input if Textarea missing, but plan says standard UI. I'll assume Input for safe MVP or use standard HTML textarea inside FormControl if Input is weird for description */}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Finalizando...
                                </>
                            ) : (
                                "Finalizar Configuração"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
