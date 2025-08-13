import { InventoryPieChart } from "@/components/InventoryPieChart";
import { SectionCards } from "@/components/SectionCards";
import { DataTable } from "@/components/table/DataTable";
import { getColumns } from "@/components/table/LatestInventoryColumns";
import { getTopColumns } from "@/components/table/TopInventoryColumns";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/layouts/DashboardLayout"
import { loadDashboard } from "@/services/api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function HomePage() {

  const { t } = useTranslation()
  const navigate = useNavigate()

  const [stats, setStats] = useState<{
    stats: {
      totalInventories: number
      inventoriesLastDay: number
      totalUsers: number
    }
    latestInventories: [],
    topInventories: []
  } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await loadDashboard();
        setStats(data)
      } catch (error) {
        console.error("Failed to load stats", error)
      }
    }
    fetchStats()
  }, [])

  if (!stats) {
    return <div>Loading...</div>
  }

  const columns = getColumns(t);
  const columnsTop = getTopColumns(t);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-center">
        <div className="aspect-video rounded-xl flex-col justify-between">
          <h2 className="text-2xl font-bold mb-4">
            {t('dashboard.topInventories')}
          </h2>
          <DataTable
            columns={columnsTop}
            data={stats.topInventories}
            showPagination={false}
          />
        </div>

        <div className="flex flex-col flex-grow justify-center">
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
      <div className="flex-1 rounded-xl md:min-h-min mb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard.latestInventories')}</h2>
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
