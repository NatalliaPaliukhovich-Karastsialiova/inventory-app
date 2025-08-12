import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useAuthStore } from "@/store/authStore"
import DashboardLayout from "@/layouts/DashboardLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/DataTable"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { getColumns, type Inventory } from "@/components/table/InventoryColumns"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { fetchInventories, fetchMyInventories } from "@/services/api"
import { ProfileSettings } from "@/components/ProfileSettings"

export default function ProfilePage() {

  const [data, setData] = useState<Inventory[]>([])
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchMyInventories()
        setData(result)
      } catch (error) {
        toast.error("Error:")
      }
    }
    getData()
  }, [])

  const columns = getColumns(t)


  const filteredData = data.filter(
    (inventory) =>
      inventory.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-">
        <ProfileSettings></ProfileSettings>
      </div>
      <div className="container mx-auto py-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("inventories")}</h2>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <Input
            placeholder={t("inventory.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log(1)}
            >
              {t("inventory.create")}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          showPagination={false}
          onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
          onRowClick={(row) => navigate(`/inventories/${row.id}`)}
        />
      </div>
    </DashboardLayout>
  )
}
