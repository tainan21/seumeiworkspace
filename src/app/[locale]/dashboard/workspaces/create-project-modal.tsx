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
import { ProjectLimitError } from "~/domains/workspace/errors";
import { createProject } from "../projects/action";

export const projectSchema = z.object({
  name: z.string().min(1, { message: "Please enter a project name." }),
  domain: z.string().min(1, { message: "Please enter a project domain." }),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export default function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      domain: "",
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    try {
      await createProject(values);
      toast({
        title: "Projeto criado com sucesso",
        description: `${values.name} foi criado com sucesso.`,
      });
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("[CreateProjectModal] Error:", error);

      if (error instanceof ProjectLimitError) {
        toast({
          title: "Limite de projetos atingido",
          description:
            "Você pode ter no máximo 3 projetos. Delete um projeto existente para criar um novo.",
          variant: "destructive",
        });
        return;
      }

      // Erro genérico
      toast({
        title: "Erro ao criar projeto",
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
          <p className="text-xl font-medium">Create a project</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="XYZ" {...field} />
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
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="xyz.com" {...field} />
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
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
