"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CopyButton from "~/components/copy-button";
import Icons from "~/components/shared/icons";
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
import { toast } from "~/hooks/use-toast";
import { updateProjectById } from "../../projects/action";
import { workspaceSchema, type WorkspaceFormValues } from "../create-project-modal";

export default function EditableDetails({
  initialValues,
}: {
  initialValues: WorkspaceFormValues & { id: string };
}) {
  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    values: initialValues,
  });

  async function onSubmit(values: WorkspaceFormValues) {
    try {
      // await updateProjectById(initialValues.id, values);
      toast({
        title: "Workspace Updated successfully.",
      });
      form.reset();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error updating workspace.",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-6">
        <FormItem>
          <FormLabel>ID</FormLabel>
          <FormControl>
            <div className="relative">
              <Input value={initialValues.id} readOnly disabled />
              <CopyButton content={initialValues.id} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

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
        {/* Domain field removed as it's not in Workspace schema */}
        <Button
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
          type="submit"
        >
          {form.formState.isSubmitting && (
            <Icons.spinner className={"mr-2 h-5 w-5 animate-spin"} />
          )}
          Save
        </Button>
      </form>
    </Form>
  );
}
