"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Icons from "~/components/shared/icons";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createWorkspace } from "./actions";

export const workspaceSchema = z.object({
  name: z.string().min(1, { message: "Por favor, insira o nome do workspace." }),
});

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export default function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: WorkspaceFormValues) {
    try {
      const result = await createWorkspace({
        name: values.name,
      });

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar workspace");
      }

      toast({
        title: "Workspace criado com sucesso",
        description: `${values.name} foi criado com sucesso.`,
      });

      form.reset();
      setIsOpen(false);

      // Redirecionar para o onboarding do novo workspace
      router.push(`/${result.data.workspaceSlug}/onboarding`);
    } catch (error) {
      console.error("[CreateWorkspaceModal] Error:", error);
      toast({
        title: "Erro ao criar workspace",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card
          role="button"
          className="hover:bg-accent flex flex-col items-center justify-center gap-y-2.5 p-8 text-center"
        >
          <Button size="icon" variant="ghost">
            <Icons.projectPlus className="h-8 w-8" />
          </Button>
          <p className="text-xl font-medium">Criar novo workspace</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Workspace</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha Empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

