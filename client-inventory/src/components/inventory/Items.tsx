import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { GalleryVerticalEnd } from "lucide-react"
import { DataTable } from "../table/DataTable"
import { useEffect, useState } from "react"
import { getColumns, type Inventory } from "../table/InventoryColumns"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { fetchInventories } from "@/services/api"
import { toast } from "sonner"

export function Items() {

  const [data, setData] = useState<Inventory[]>([])
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchInventories()
        setData(result)
      } catch (error) {
        toast.error("Error:")
      }
    }
    getData()
  }, [])

  const columns = getColumns(t)

  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={true}
      getRowId={(row) => row.id}
      onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
      onRowClick={(row) => navigate(`/inventories/${row.id}`)}
    />
  )
}
