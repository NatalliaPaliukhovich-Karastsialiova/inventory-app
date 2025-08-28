import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchInventoryById,
  fetchItemById,
  likeItem,
  unlikeItem
} from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { ItemForm } from "@/components/inventory/ItemForm";
import type { Item, CustomIDField, CustomField, Inventory } from "@/types";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

export default function ItemPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customIdElements, setCustomIdElements] = useState<CustomIDField[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [, setIsSaving] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);
  const [likedByMe, setLikedByMe] = useState<boolean>(false);
  const user = useAuthStore.getState().user;
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        if (itemId && id) {
          const data = await fetchItemById(itemId as string);
          setItem(data);
          setInventory(data?.inventory);
          setCustomFields(data?.inventory.inventoryField ?? []);
          setCustomIdElements(data?.inventory.customIdElements ?? []);
          setLikes((data as any)?.likes ?? 0);
          setLikedByMe((data as any)?.likedByMe ?? false);
        } else if (!itemId && id) {
          const data = await fetchInventoryById(id as string);
          setInventory(data);
          setCustomFields(data?.inventoryField ?? []);
          setCustomIdElements(data?.customIdElements ?? []);
        }
      } catch (error) {
        toast.error("Failed to load inventory");
      }
    }
    load();
  }, [itemId]);

  return (
    <DashboardLayout>
      <div className="container mx-auto pt-1 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventories">
               {t("inventoryDetails.inventories")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/inventories/${inventory?.id}`}>
                {inventory?.title || "Inventory"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <div className="flex items-center gap-2">
                <BreadcrumbPage>{"Item"}</BreadcrumbPage>
                {item?.id && (item?.writeAccess || inventory?.writeAccess) && (
                  <>
                    {hasPendingChanges ? (
                      <Badge variant="secondary">
                        {t("common.unsavedChanges")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {t("common.allChangesSaved")}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {!customFields.length ? (
          <div className="bg-muted/50 min-h-[60vh] flex-1 rounded-xl md:min-h-min p-10 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Loader2 className="animate-spin" />
            </div>
            <Skeleton className="h-10 w-32 ml-auto" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-10">
            <div className="flex justify-end mb-2">
              {item && (
                <Button
                  variant={likedByMe ? "secondary" : "outline"}
                  className="flex items-center gap-2"
                  onClick={async () => {
                    try {
                      if (!item) return;
                      if (!user) return;
                      if (likedByMe) {
                        const res = await unlikeItem(item.id);
                        setLikes(res.likes);
                        setLikedByMe(false);
                      } else {
                        const res = await likeItem(item.id);
                        setLikes(res.likes);
                        setLikedByMe(true);
                      }
                    } catch (e) {}
                  }}
                  disabled={!user}
                >
                  <Heart
                    className={likedByMe ? "fill-red-500 text-red-500" : ""}
                  />
                  <span>{likes}</span>
                </Button>
              )}
            </div>
            <ItemForm
              templateFields={customFields}
              inventoryId={inventory?.id as string}
              readOnly={!(item?.writeAccess || inventory?.writeAccess)}
              item={item}
              setItem={setItem}
              enableAutoSave
              onDirtyChange={setHasPendingChanges}
              onSavingChange={setIsSaving}
              customIdElements={customIdElements}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
