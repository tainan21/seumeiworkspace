"use client";

import { useRouter } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { createProjectAction } from "./actions";

const projectSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  domain: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  workspaceId: string;
  projectId?: string;
  defaultValues?: Partial<ProjectFormValues>;
}

/**
 * Formulário de criação/edição de projeto
 */
export function ProjectForm({
  workspaceId,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues || {
      name: "",
      domain: "",
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (projectId) {
        // TODO: Implementar update
        toast({
          title: "Atualização ainda não implementada",
          variant: "destructive",
        });
        return;
      }

      const result = await createProjectAction(workspaceId, data);

      if (result.success) {
        toast({
          title: "Projeto criado com sucesso",
          description: `${data.name} foi criado.`,
        });
        router.push(`/${workspaceId}/projects/${result.projectId}`);
        router.refresh();
      } else {
        throw new Error(result.error || "Erro ao criar projeto");
      }
    } catch (error) {
      console.error("[ProjectForm] Error:", error);
      toast({
        title: "Erro ao criar projeto",
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome do Projeto <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Meu Projeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domínio (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="meu-projeto" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Se não informado, será gerado automaticamente baseado no nome
              </p>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {projectId ? "Salvando..." : "Criando..."}
              </>
            ) : (
              projectId ? "Salvar" : "Criar Projeto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
