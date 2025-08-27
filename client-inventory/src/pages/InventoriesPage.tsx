import DashboardLayout from "@/layouts/DashboardLayout";
import { DataTable } from "@/components/table/DataTable";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import {
  getColumns,
} from "@/components/table/InventoryColumns";
import { fetchInventories } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { Inventory } from "@/types";

export default function InventoriesPage() {
  const [data, setData] = useState<Inventory[]>([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchInventories();
        setData(result);
      } catch (error) {
        toast.error("Error:");
      }
    }
    getData();
  }, []);

  const columns = getColumns(t);

  const filteredData = data.filter((inventory) =>
    inventory.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("inventoriesPage.inventories")}</h2>
        </div>
        <div className="flex justify-between gap-2">
          <Input
            placeholder={t("inventory.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm h-10"
          />
          {user && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/inventories/new`)}
            >
              <Plus className="w-4 h-4" />
              {t("inventory.create")}
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          showPagination={true}
          getRowId={(row) => row.id}
          onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
          onRowClick={(row) => navigate(`/inventories/${row.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
