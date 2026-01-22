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
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";
import { Uploader } from "~/components/onboarding/primitives/uploader";
import { validateCompanyIdentifier } from "~/domains/company";
import { submitEnterpriseStep } from "~/app/[locale]/[workspace]/onboarding/actions";
import { toast } from "~/hooks/use-toast";
import { useState } from "react";

const enterpriseSchema = z.object({
    legalName: z.string().min(3, "Razão social deve ter pelo menos 3 caracteres"),
    fantasyName: z.string().optional(),
    document: z.string().optional(), // Opcional
    documentType: z.enum(["CNPJ", "CPF"]).optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    // Endereço totalmente opcional
    zipCode: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().length(2, "UF deve ter 2 letras").optional().or(z.literal("")),
    logo: z.string().optional(),
});

type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;

interface EnterpriseStepProps {
    workspaceId: string;
    onSuccess: () => void;
}

export default function EnterpriseStep({ workspaceId, onSuccess }: EnterpriseStepProps) {
    const [loading, setLoading] = useState(false);
    const [documentType, setDocumentType] = useState<"CNPJ" | "CPF">("CNPJ");
    const [documentError, setDocumentError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | undefined>();

    const form = useForm<EnterpriseFormValues>({
        resolver: zodResolver(enterpriseSchema),
        defaultValues: {
            legalName: "",
            fantasyName: "",
            document: "",
            documentType: "CNPJ",
            email: "",
            phone: "",
            zipCode: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            logo: "",
        },
    });

    const handleDocumentChange = (value: string) => {
        setDocumentError(null);
        
        // Se vazio, limpar campo e erro
        if (!value || value.trim() === "") {
            form.setValue("document", "");
            return;
        }

        const validation = validateCompanyIdentifier(value, documentType);
        
        if (validation.status === "invalid") {
            // Mostrar erro, mas manter o valor para permitir correção
            setDocumentError(validation.errors.join(", "));
            form.setValue("document", value);
        } else if (validation.status === "valid") {
            // Documento válido, formatar
            form.setValue("document", validation.formatted);
            setDocumentError(null);
        } else if (validation.status === "optional") {
            // Campo opcional, apenas limpar erro
            form.setValue("document", value);
            setDocumentError(null);
        } else {
            form.setValue("document", value);
        }
    };

    async function onSubmit(data: EnterpriseFormValues) {
        // Validar documento apenas se fornecido
        let documentToSubmit: string | undefined = undefined;
        
        if (data.document && data.document.trim()) {
            const validation = validateCompanyIdentifier(data.document, documentType);
            
            if (validation.status === "invalid") {
                setDocumentError(validation.errors.join(", "));
                toast({
                    title: "Documento inválido",
                    description: validation.errors.join(", "),
                    variant: "destructive",
                });
                return;
            }
            
            // Usar documento formatado se válido
            if (validation.status === "valid") {
                documentToSubmit = validation.formatted;
            } else {
                documentToSubmit = data.document;
            }
        }

        setLoading(true);
        try {
            await submitEnterpriseStep(workspaceId, {
                ...data,
                document: documentToSubmit,
            });
            toast({
                title: "Empresa configurada!",
                description: "Os dados foram salvos com sucesso.",
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Upload de Logo */}
                <div>
                    <Label>Logo da Empresa (Opcional)</Label>
                    <Uploader
                        accept="image/*"
                        maxSize={5}
                        value={logoUrl}
                        onUpload={async (file) => {
                            const url = URL.createObjectURL(file);
                            setLogoUrl(url);
                            form.setValue("logo", url);
                            return url;
                        }}
                        onRemove={() => {
                            if (logoUrl?.startsWith("blob:")) {
                                URL.revokeObjectURL(logoUrl);
                            }
                            setLogoUrl(undefined);
                            form.setValue("logo", "");
                        }}
                        className="mt-2"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="legalName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Razão Social / Nome Completo *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sua Empresa LTDA" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fantasyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome Fantasia (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nome da Loja" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <Label>CPF ou CNPJ (Opcional)</Label>
                        <div className="flex gap-2">
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value as "CNPJ" | "CPF")}
                                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="CNPJ">CNPJ</option>
                                <option value="CPF">CPF</option>
                            </select>
                            <FormField
                                control={form.control}
                                name="document"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input
                                                placeholder={documentType === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                                                value={field.value?.replace(/\D/g, "") || ""}
                                                onChange={(e) => handleDocumentChange(e.target.value)}
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {documentError && (
                            <p className="text-sm text-destructive">{documentError}</p>
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefone / WhatsApp</FormLabel>
                                <FormControl>
                                    <Input placeholder="(11) 99999-9999" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Endereço (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CEP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="00000-000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rua</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome da rua" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="complement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Complemento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sala 1, Apto 2..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="neighborhood"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bairro</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Centro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <FormControl>
                                            <Input placeholder="São Paulo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado (UF)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="SP" maxLength={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            "Continuar para Categoria"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
