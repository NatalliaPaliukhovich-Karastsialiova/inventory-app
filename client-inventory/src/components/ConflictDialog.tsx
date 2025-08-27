import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ConflictDialog({ open, onReload, onClose }: { open: boolean; onReload: () => void; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('conflict.title')}</DialogTitle>
          <DialogDescription>
            {t('conflict.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('conflict.close')}</Button>
          <Button onClick={onReload}>{t('conflict.reload')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


