"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useScopedI18n } from "~/locales/client";

interface CancelConfirmModalProps {
  reset: () => void;
  isDisabled: boolean;
}

export default function CancelConfirmModal({
  reset,
  isDisabled,
}: CancelConfirmModalProps) {
  const tResetModal = useScopedI18n("settings.resetModal");
  const tButtons = useScopedI18n("settings.buttons");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" type="reset" disabled={isDisabled}>
          {tButtons("reset")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tResetModal("title")}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={reset}>
            {tResetModal("confirm")}
          </AlertDialogCancel>
          <AlertDialogAction>{tResetModal("cancel")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
