import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { createSupportTicket } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inventoryId?: string | null;
  adminEmails: string[];
  currentUrl: string;
};

export function SupportTicketDialog({ open, onOpenChange, inventoryId, adminEmails, currentUrl }: Props) {
  const { t } = useTranslation();
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<"High" | "Average" | "Low">("Average");
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setLoading(true);
    try {
      await createSupportTicket({
        summary,
        priority,
        link: currentUrl,
        inventoryId: inventoryId || undefined,
        adminEmails
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ticket.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">{t("ticket.summary")}</Label>
            <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">{t("ticket.priority")}</Label>
            <select
              id="priority"
              className="w-full h-9 border rounded-md px-2 bg-background"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="High">{t("ticket.high")}</option>
              <option value="Average">{t("ticket.average")}</option>
              <option value="Low">{t("ticket.low")}</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            {t("ticket.reportedBy")}: {user?.fullName || user?.email}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("ticket.link")}: {currentUrl}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !summary.trim()}>
              {loading ? t("common.loading") : t("ticket.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
