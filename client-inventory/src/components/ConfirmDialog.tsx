import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "i18next";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{cancelLabel ?? t("common.cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel ?? t("common.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


