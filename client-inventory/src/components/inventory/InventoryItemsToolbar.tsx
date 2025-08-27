import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { batchDeleteItems } from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { t } from "i18next";

export default function InventoryItemsToolbar({ inventoryId, canWrite }: { inventoryId: string; canWrite: boolean }) {
  const [q, setQ] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: CustomEvent<string[]>) => setSelectedIds(e.detail);
    window.addEventListener("inventory-items-selection" as any, handler as any);
    return () => window.removeEventListener("inventory-items-selection" as any, handler as any);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => setQ(e.detail);
    window.addEventListener("inventory-items-search" as any, handler as any);
    return () => window.removeEventListener("inventory-items-search" as any, handler as any);
  }, []);

  return (
    <div className="flex justify-between gap-2 my-2">
      <Input
        placeholder={t("inventory.searchItems")}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          window.dispatchEvent(new CustomEvent("inventory-items-search", { detail: e.target.value } as any));
        }}
        className="max-w-sm"
      />
      <div className="flex gap-2">
        {canWrite && (
          <>
            <Button variant="outline" onClick={() => navigate(`/inventories/${inventoryId}/items/new`)}>
              <Plus/>
              {t("inventory.create")}
            </Button>
            <Button
              variant="destructive"
              disabled={!selectedIds.length}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash/>
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              title={t("inventoryDetails.confirmDeletion")}
              description={t("inventoryDetails.deleteInventoryConfirmation")}
              confirmLabel={t("common.delete")}
              onConfirm={async () => {
                setConfirmOpen(false);
                try {
                  await batchDeleteItems(inventoryId, selectedIds);
                  toast.success(t("ADMIN_ACTION_APPLIED_SUCCESS"));
                  window.dispatchEvent(new CustomEvent("inventory-items-reload" as any));
                } catch (e) {
                  toast.error(t("common.error"));
                }
              }}
              onClose={() => setConfirmOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}


