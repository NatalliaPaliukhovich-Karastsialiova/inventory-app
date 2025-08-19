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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {

  const [myInventories, setMyInventories] = useState<Inventory[]>([])
  const [inventoriesWithAccess, setInventoriesWithAccess] = useState<Inventory[]>([])
  const [search, setSearch] = useState("")
  const [searchAccess, setSearchAccess] = useState("")
  const { t, i18n } = useTranslation()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const resultMy = await fetchMyInventories('own')
        setMyInventories(resultMy)
        const resultWrite = await fetchMyInventories('write')
        setInventoriesWithAccess(resultWrite)
      } catch (error) {
        toast.error(t("common.error"))
      }
    }
    getData()
  }, [])

  const columns = getColumns(t)


  const filteredMyInventories = myInventories.filter(
    (inventory) =>
      inventory.title?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredInventoriesWrite = inventoriesWithAccess.filter(
    (inventory) =>
      inventory.title?.toLowerCase().includes(searchAccess.toLowerCase())
  )

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
              <h2 className="text-2xl font-bold">{t("profilePage.myInventories")}</h2>
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
              data={filteredMyInventories}
              showPagination={true}
              onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
              onRowClick={(row) => navigate(`/inventories/${row.id}`)}
            />
          </div>
        </TabsContent>
        <TabsContent value="write">
          <div className="container mx-auto py-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("profilePage.inventoriesCanWriteTo")}</h2>
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
              columns={columns}
              data={filteredInventoriesWrite}
              showPagination={true}
              onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
              onRowClick={(row) => navigate(`/inventories/${row.id}`)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
