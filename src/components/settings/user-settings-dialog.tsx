"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const IntegrationSettingsPanel = dynamic(
  () =>
    import("@/components/settings/integration-settings-panel").then(
      (m) => m.IntegrationSettingsPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export function UserSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (typeof next === "boolean") onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-h-[85vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Налаштування</DialogTitle>
          <DialogDescription>
            Підключення Gmail і Telegram та промпти для нейромережі при синхронізації.
          </DialogDescription>
        </DialogHeader>
        {open ? <IntegrationSettingsPanel embedded className="pt-2" /> : null}
      </DialogContent>
    </Dialog>
  );
}
