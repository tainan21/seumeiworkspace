"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { useScopedI18n } from "~/locales/client";
import { type User } from "~/lib/server/auth/session";
import { settingsSchema, type SettingsValues } from "~/types";
import {
  removeNewImageFromCDN,
  removeUserOldImageFromCDN,
  updateUser,
} from "./actions";

const ImageUploadModal = dynamic(
  () => import("~/components/layout/image-upload-modal")
);
const CancelConfirmModal = dynamic(
  () => import("~/components/layout/cancel-confirm-modal")
);

// Função auxiliar para obter iniciais do nome
function getInitials(name: string | null | undefined): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || "A";
}

export default function SettingsForm({ currentUser }: { currentUser: User }) {
  const oldImage = useRef(currentUser.picture ?? "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const t = useScopedI18n("settings");

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: currentUser.name ?? "",
      email: currentUser.email ?? "",
      picture: currentUser.picture ?? "",
    },
  });

  const { formState, getFieldState, handleSubmit, reset, getValues } = form;
  const { isDirty: isImageChanged } = getFieldState("picture");

  useEffect(() => {
    reset({
      name: currentUser.name ?? "",
      email: currentUser.email ?? "",
      picture: currentUser.picture ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (isImageChanged && currentUser.picture !== oldImage.current) {
      oldImage.current = currentUser.picture ?? "";
    }
  }, [currentUser.picture, isImageChanged]);

  const onSubmit = handleSubmit((data: SettingsValues) => {
    startTransition(async () => {
      try {
        if (currentUser.picture && isImageChanged) {
          await removeUserOldImageFromCDN(data.picture, currentUser.picture);
        }
        await updateUser(currentUser.id, data);
        toast({ title: t("messages.updated") });
      } catch (error) {
        console.log(JSON.stringify(error));
        toast({ title: t("messages.error"), variant: "destructive" });
      }
    });
  });

  const handleReset = async () => {
    if (isImageChanged) {
      try {
        await removeNewImageFromCDN(getValues().picture);
      } catch (error) {
        console.log(error);
      }
    }
    reset();
  };

  const isFormDisabled = useMemo(
    () => formState.isSubmitting || isPending || !formState.isDirty,
    [formState.isSubmitting, isPending, formState.isDirty]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="max-w-2xl space-y-8 rounded-md border p-6"
      >
        <FormField
          control={form.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("picture.label")}</FormLabel>
              <FormDescription>{t("picture.description")}</FormDescription>
              <FormControl>
                <Avatar className="group relative h-28 w-28 rounded-full">
                  <AvatarImage src={field.value} alt={getValues().name ?? ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(getValues().name)}
                  </AvatarFallback>
                  <ImageUploadModal onImageChange={field.onChange} />
                </Avatar>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("name.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email.label")}</FormLabel>
              <FormControl>
                <Input
                  className="bg-muted"
                  readOnly
                  placeholder={t("email.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="inline-flex gap-x-4">
          <CancelConfirmModal reset={handleReset} isDisabled={isFormDisabled} />

          <Button type="submit" disabled={isFormDisabled}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("buttons.updating")}
              </>
            ) : (
              t("buttons.update")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
