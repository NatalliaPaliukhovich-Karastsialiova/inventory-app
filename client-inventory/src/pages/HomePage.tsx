import { InventoryPieChart } from "@/components/InventoryPieChart";
import { SectionCards } from "@/components/SectionCards";
import { DataTable } from "@/components/table/DataTable";
import { getColumns } from "@/components/table/LatestInventoryColumns";
import { getTopColumns } from "@/components/table/TopInventoryColumns";
import DashboardLayout from "@/layouts/DashboardLayout";
import { loadDashboard } from "@/services/api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TagCloud from "@/components/TagCloud";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<{
    stats: {
      totalInventories: number;
      inventoriesLastDay: number;
      totalUsers: number;
    };
    latestInventories: [];
    topInventories: [];
  } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await loadDashboard();
        setStats(data);
      } catch (error) {
        console.error(t("homePage.failedToLoadStats"), error);
      }
    }
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          <div className="md:col-span-2 rounded-xl flex flex-col">
            <div className="h-7 w-48 mb-4 flex items-center gap-2">
              <Skeleton className="h-7 w-48" />
              <Loader2 className="animate-spin" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col gap-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>

        <div className="mt-6">
          <Skeleton className="h-6 w-60 mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>

        <div className="flex-1 rounded-xl md:min-h-min mt-6 mb-10">
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-56 mb-4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const columns = getColumns(t);
  const columnsTop = getTopColumns(t);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-2 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold mb-4">
            {t("dashboard.topInventories")}
          </h2>
          <DataTable
            columns={columnsTop}
            data={stats.topInventories}
            showPagination={false}
            onRowClick={(row) => navigate(`/inventories/${row.id}`)}
          />
        </div>

        <div className="md:col-span-1 flex flex-col">
          <InventoryPieChart
            inventoriesLastDay={stats.stats.inventoriesLastDay}
            totalInventories={stats.stats.totalInventories}
          />
        </div>
      </div>
      <SectionCards
        inventoriesLastDay={stats.stats.inventoriesLastDay}
        totalInventories={stats.stats.totalInventories}
        totalUsers={stats.stats.totalUsers}
      />
      <div className="flex-1 rounded-xl md:min-h-min mb-6">
        <h2 className="text-2xl font-bold mb-2">{t("dashboard.tags")}</h2>
        <TagCloud />
      </div>
      <div className="flex-1 rounded-xl md:min-h-min mb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("dashboard.latestInventories")}
          </h2>
        </div>
        <DataTable
          columns={columns}
          data={stats.latestInventories}
          showPagination={false}
          onRowClick={(row) => navigate(`/inventories/${row.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
