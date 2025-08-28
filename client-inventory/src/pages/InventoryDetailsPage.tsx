import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createInventory,
  fetchInventoryById,
  updateInventory,
  deleteInventory
} from "@/services/api";
import type { Inventory, UserAccessList, InventoryTag } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Items } from "@/components/inventory/Items";
import InventoryItemsToolbar from "@/components/inventory/InventoryItemsToolbar";
import { useAuthStore } from "@/store/authStore";
import { Settings } from "@/components/inventory/Settings";
import { CustomIDBuilder } from "@/components/inventory/CustomIDBuilder";
import { InventoryFieldBuilder } from "@/components/inventory/InventoryFieldBuilder";
import UserAccessTable from "@/components/inventory/UserAccessTable";
import Chat from "@/components/inventory/Chat";
import { useTranslation } from "react-i18next";
import InventoryStats from "@/components/inventory/InventoryStats";
import ConflictDialog from "@/components/ConflictDialog";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function InventoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const inventoryRef = useRef<Inventory | null>(null);
  const [accessList, setAccessList] = useState<UserAccessList[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("items");
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [hasCustomIdErrors, setHasCustomIdErrors] = useState(false);
  const user = useAuthStore.getState().user;
  const { t } = useTranslation();
  const formRef = useRef<any>(null);
  const lastLocalChangeAtRef = useRef<number>(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function markLocalChange() {
    lastLocalChangeAtRef.current = Date.now();
  }

  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  const setInventorySafe = (
    updater: Inventory | ((prev: Inventory | null) => Inventory | null) | null
  ) => {
    if (typeof updater === "function") {
      setInventory((prev) => {
        const next = (updater as (p: Inventory | null) => Inventory | null)(
          prev
        );
        inventoryRef.current = next as Inventory | null;
        return next as Inventory | null;
      });
    } else {
      setInventory(updater as Inventory | null);
      inventoryRef.current = updater as Inventory | null;
    }
  };

  useEffect(() => {
    async function load() {
      try {
        if (id) {
          const data = await fetchInventoryById(id as string);
          setInventory(data);
          setAccessList(data?.accessList ?? []);
          setIsNew(false);
        } else {
          const inst: Inventory = {
            isPublic: false,
            title: t("inventory.settings.newInventory"),
            category: "",
            description: "",
            id: "",
            imageUrl: "",
            createdAt: "",
            ownerId: "",
            owner: {
              avatar: "",
              createdAt: "",
              email: "",
              fullName: "",
              id: "",
              status: "active"
            }
          };
          setInventory(inst);
          setIsNew(true);
        }
      } catch {
        toast.error(t("inventoryDetails.failedToLoadInventory"));
      }
    }
    load();
  }, [id]);

  async function handleGlobalSave({
    silent = false
  }: { silent?: boolean } = {}) {
    if (isSaving || hasCustomIdErrors) return;
    setIsSaving(true);

    let savedSuccessfully = false;
    const saveStartedAt = Date.now();

    try {
      if (!inventory) return;

      const isValid = await formRef.current?.trigger?.(["title", "category"]);
      if (isValid === false) {
        if (!silent) {
          toast.error(t("inventoryDetails.failedToSaveInventory"));
        }
        return;
      }

      const formValues = formRef.current?.getValues?.();

      const payload: any = {
        title: formValues?.title ?? inventory.title,
        description: formValues?.description ?? inventory.description ?? "",
        category: formValues?.category ?? inventory.category,
        imageUrl: formValues?.imageUrl ?? inventory.imageUrl ?? null,
        isPublic: formValues?.isPublic ?? inventory.isPublic ?? false,
        version: (inventory as Inventory).version,
        tags: Array.isArray(inventoryRef.current?.tags)
          ? (inventoryRef.current?.tags as InventoryTag[]).map((t) => t.tag)
          : []
      };
      if (inventoryRef.current?.customIdElements)
        payload.customIdElements = (inventoryRef.current as any).customIdElements;
      if (inventoryRef.current?.inventoryField)
        payload.inventoryField = (inventoryRef.current as any).inventoryField;
      if (accessList) payload.accessList = accessList;
      if (inventory?.id) {
        try {
          const updated = await updateInventory(inventory.id, payload);
          const hadLaterChanges = lastLocalChangeAtRef.current > saveStartedAt;
          if (hadLaterChanges) {
            const latest = inventoryRef.current as Inventory;
            setInventorySafe({
              ...(updated as any),
              tags: (latest as any)?.tags ?? (updated as any)?.tags,
              customIdElements: (latest as any)?.customIdElements ?? (updated as any)?.customIdElements,
              inventoryField: (latest as any)?.inventoryField ?? (updated as any)?.inventoryField,
              accessList: (latest as any)?.accessList ?? (updated as any)?.accessList
            } as any);
          } else {
            setInventorySafe(updated as any);
          }
          savedSuccessfully = true;
          if (!silent) toast.success(t("inventoryDetails.inventoryUpdated"));
        } catch (e: any) {
          if (e?.response?.status === 409) {
            setConflictOpen(true);
            return;
          }
          throw e;
        }
      } else {
        const created = await createInventory(payload);
        setInventory(created as any);
        savedSuccessfully = true;
        if (!silent) toast.success(t("inventoryDetails.inventoryCreated"));
        navigate(`/inventories/${created.id}`);
      }
    } catch {
      if (!silent) toast.error(t("inventoryDetails.failedToSaveInventory"));
    } finally {
      setIsSaving(false);
      if (savedSuccessfully && lastLocalChangeAtRef.current <= saveStartedAt) {
        setHasPendingChanges(false);
      }
    }
  }

  useEffect(() => {
    setActiveTab(isNew ? "settings" : "items");
  }, [isNew]);

  useEffect(() => {
    if (isNew) return;
    let timeoutId: number | undefined;
    let canceled = false;
    function scheduleNext() {
      if (canceled) return;
      const delay = 7000 + Math.floor(Math.random() * 3000);
      timeoutId = window.setTimeout(async () => {
        try {
          const canEdit = !!user && (!!inventory?.ownerOrAdmin || isNew);
          const shouldSave =
            hasPendingChanges &&
            canEdit &&
            activeTab !== "items" &&
            activeTab !== "chat" &&
            !isSaving &&
            !hasCustomIdErrors;
          if (shouldSave) await handleGlobalSave({ silent: true });
        } finally {
          scheduleNext();
        }
      }, delay);
    }
    scheduleNext();
    return () => {
      canceled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [
    activeTab,
    hasPendingChanges,
    isSaving,
    user,
    inventory?.ownerOrAdmin,
    isNew,
    hasCustomIdErrors
  ]);

  return (
    <DashboardLayout>
      {!inventory ? (
        <div className="container mx-auto pt-1 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Loader2 className="animate-spin" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : (
        <div className="container mx-auto pt-1 space-y-4">
          <Breadcrumb>
            <BreadcrumbList className="flex flex-wrap gap-1 text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/inventories">
                  {t("inventoryDetails.inventories")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{inventory?.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex gap-3 items-center flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {inventory?.title}
              </h1>
              {user && inventory?.ownerOrAdmin && !isNew && (
                <div className="flex items-center gap-2">
                  {hasPendingChanges ? (
                    <Badge variant="secondary">
                      {t("common.unsavedChanges")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {t("common.allChangesSaved")}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {user &&
              (inventory?.ownerOrAdmin || isNew) &&
              ["settings", "custom_id", "access", "fields"].includes(
                activeTab
              ) && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {inventory?.ownerOrAdmin && !isNew && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ConfirmDialog
                        open={deleteOpen}
                        title={t("inventoryDetails.confirmDeletion")}
                        description={t(
                          "inventoryDetails.deleteInventoryConfirmation"
                        )}
                        confirmLabel={t("common.delete")}
                        onConfirm={async () => {
                          setDeleteOpen(false);
                          try {
                            if (!inventory?.id) return;
                            await deleteInventory(inventory.id);
                            navigate(`/inventories`);
                          } catch (e) {
                            toast.error(t("common.error"));
                          }
                        }}
                        onClose={() => setDeleteOpen(false)}
                      />
                    </>
                  )}
                  <Button
                    onClick={() => handleGlobalSave()}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? t("common.saving") : t("common.save")}
                  </Button>
                </div>
              )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val)}
            className="w-full"
          >
            <TabsList
              className="grid grid-cols-2 sm:flex sm:flex-wrap w-full gap-2 h-auto !overflow-visible"
              style={{ minHeight: "auto" }}
            >
              {!isNew && (
                <>
                  <TabsTrigger value="items" className="flex-1 min-w-[100px]">
                    {t("inventoryDetails.items")}
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1 min-w-[100px]">
                    {t("inventoryDetails.discussion")}
                  </TabsTrigger>
                </>
              )}
              {user && (
                <>
                  <TabsTrigger
                    value="settings"
                    className="flex-1 min-w-[100px]"
                  >
                    {t("inventoryDetails.settings")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom_id"
                    className="flex-1 min-w-[140px]"
                  >
                    {t("inventoryDetails.customID")}
                  </TabsTrigger>
                  <TabsTrigger value="fields" className="flex-1 min-w-[100px]">
                    {t("inventoryDetails.fields")}
                  </TabsTrigger>
                  <TabsTrigger value="access" className="flex-1 min-w-[100px]">
                    {t("inventoryDetails.access")}
                  </TabsTrigger>
                  {!isNew && (
                    <TabsTrigger value="stats" className="flex-1 min-w-[100px]">
                      {t("inventoryDetails.statistics")}
                    </TabsTrigger>
                  )}
                </>
              )}
            </TabsList>

            <TabsContent
              value="items"
              className="flex flex-col flex-1 overflow-hidden"
            >
              <InventoryItemsToolbar
                inventoryId={id as string}
                canWrite={!!(user && inventory?.writeAccess)}
              />
              <Items itemsConfig={(inventory as any)?.inventoryField ?? []} />
            </TabsContent>

            <TabsContent value="chat">
              <Chat
                inventoryId={inventory?.id as string}
                readOnly={!inventory?.writeAccess}
              />
            </TabsContent>

            <TabsContent value="settings">
              <Settings
                inventory={inventory}
                setInventory={(val) => {
                  setInventory(val);
                  setHasPendingChanges(true);
                  markLocalChange();
                }}
                readOnly={!(inventory?.ownerOrAdmin || isNew)}
                formRef={formRef}
              />
            </TabsContent>

            <TabsContent value="custom_id">
              <div className="bg-muted/50 min-h-[60vh] sm:min-h-min flex-1 rounded-xl p-4 sm:p-10">
                <CustomIDBuilder
                  initialFields={(inventory as any)?.customIdElements ?? []}
                  onChange={(fields, hasErrors) => {
                    setInventorySafe((prev) =>
                      prev ? ({ ...prev, customIdElements: fields } as any) : prev
                    );
                    setHasPendingChanges(true);
                    setHasCustomIdErrors(hasErrors);
                    markLocalChange();
                  }}
                  readOnly={!(inventory?.ownerOrAdmin || isNew)}
                />
              </div>
            </TabsContent>

            <TabsContent value="fields">
              <div className="bg-muted/50 min-h-[60vh] sm:min-h-min flex-1 rounded-xl p-4 sm:p-10">
                <InventoryFieldBuilder
                  initialFields={(inventory as any)?.inventoryField ?? []}
                  onChange={(fields) => {
                    setInventorySafe((prev) =>
                      prev ? ({ ...prev, inventoryField: fields } as any) : prev
                    );
                    setHasPendingChanges(true);
                    markLocalChange();
                  }}
                  readOnly={!(inventory?.ownerOrAdmin || isNew)}
                />
              </div>
            </TabsContent>

            <TabsContent value="access">
              <div className="min-h-[60vh] sm:min-h-min flex-1 rounded-xl p-4 sm:p-10">
                <UserAccessTable
                  initialUsers={accessList}
                  onChange={(list) => {
                    setAccessList(list);
                    setHasPendingChanges(true);
                    markLocalChange();
                  }}
                  readOnly={!(inventory?.ownerOrAdmin || isNew)}
                />
              </div>
            </TabsContent>

            <TabsContent value="stats">
              {inventory?.id && <InventoryStats inventoryId={inventory.id} />}
            </TabsContent>
          </Tabs>
          <ConflictDialog
            open={conflictOpen}
            onClose={() => setConflictOpen(false)}
            onReload={async () => {
              try {
                if (!id) return;
                const data = await fetchInventoryById(id as string);
                setInventory(data);
                setAccessList(data?.accessList ?? []);
                setIsNew(false);
                setHasPendingChanges(false);
                setConflictOpen(false);
              } catch {}
            }}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
