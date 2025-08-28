import DashboardLayout from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getColumns } from "@/components/table/InventoryColumns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchMyInventories } from "@/services/api";
import { deleteInventory } from "@/services/api";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash } from "lucide-react";
import type { Inventory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [myInventories, setMyInventories] = useState<Inventory[]>([]);
  const [inventoriesWithAccess, setInventoriesWithAccess] = useState<
    Inventory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchAccess, setSearchAccess] = useState("");
  const { t } = useTranslation();
  const [selectedInventories, setSelectedInventories] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const resultMy = await fetchMyInventories("own");
        setMyInventories(resultMy);
        const resultWrite = await fetchMyInventories("write");
        setInventoriesWithAccess(resultWrite);
      } catch (error) {
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  const columnsMyInventory = [
    {
      id: "select",
      header: ({ table }: any) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("table.columns.userAccess.selectAll")}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("table.columns.userAccess.selectRow")}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    ...getColumns(t)
  ] as any;

  const filteredMyInventories = myInventories.filter((inventory) =>
    inventory.title?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInventoriesWrite = inventoriesWithAccess.filter((inventory) =>
    inventory.title?.toLowerCase().includes(searchAccess.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid auto-rows-min gap-4 md:grid-cols-">
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-64" />
            <Loader2 className="animate-spin" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-">
        <ProfileSettings />
      </div>
      <Tabs defaultValue="own" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="own">{t("profilePage.own")}</TabsTrigger>
          <TabsTrigger value="write">{t("profilePage.access")}</TabsTrigger>
        </TabsList>
        <TabsContent value="own">
          <div className="container mx-auto py-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {t("profilePage.myInventories")}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Input
                placeholder={t("inventory.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/inventories/new`)}
                >
                  <Plus />
                  {t("inventory.create")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedInventories.length === 0}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash />
                </Button>
                <ConfirmDialog
                  open={confirmOpen}
                  title={t("profilePage.confirmDeleteTitle")}
                  description={t("profilePage.confirmDeleteDescription")}
                  onConfirm={async () => {
                    setConfirmOpen(false);
                    try {
                      if (!selectedInventories.length) return;
                      for (const invId of selectedInventories) {
                        await deleteInventory(invId);
                      }
                      const resultMy = await fetchMyInventories("own");
                      setMyInventories(resultMy);
                      setSelectedInventories([]);
                    } catch (e) {
                      toast.error(t("common.error"));
                    }
                  }}
                  onClose={() => setConfirmOpen(false)}
                />
              </div>
            </div>
            <DataTable
              columns={columnsMyInventory}
              data={filteredMyInventories}
              showPagination={true}
              onSelectionChange={(ids: string[]) => setSelectedInventories(ids)}
              onRowClick={(row) => navigate(`/inventories/${row.id}`)}
            />
          </div>
        </TabsContent>
        <TabsContent value="write">
          <div className="container mx-auto py-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {t("profilePage.inventoriesCanWriteTo")}
              </h2>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Input
                placeholder={t("inventory.searchPlaceholder")}
                value={searchAccess}
                onChange={(e) => setSearchAccess(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <DataTable
              columns={getColumns(t)}
              data={filteredInventoriesWrite}
              showPagination={true}
              onRowClick={(row) => navigate(`/inventories/${row.id}`)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
