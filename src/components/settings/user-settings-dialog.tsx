"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IntegrationSettingsPanel } from "@/components/settings/integration-settings-panel";

export function UserSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Налаштування</DialogTitle>
          <DialogDescription>
            Підключення Gmail і Telegram та промпти для нейромережі при синхронізації.
          </DialogDescription>
        </DialogHeader>
        <IntegrationSettingsPanel embedded className="pt-2" />
      </DialogContent>
    </Dialog>
  );
}
