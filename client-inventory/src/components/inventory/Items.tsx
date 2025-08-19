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
import { getColumns, type CustomField, type Item } from "../table/ItemColumns"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/store/authStore"
import { useNavigate, useParams } from "react-router-dom"
import { fetchItems } from "@/services/api"
import { toast } from "sonner"

interface ItemsProps {
  itemsConfig?: CustomField[];
}

export function Items({
  itemsConfig = [],
}: ItemsProps) {

  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchItems(id as string)
        setData(result)
      } catch (error) {
        toast.error(t("common.error"))
      }
    }
    getData()
  }, [])

  const columns = getColumns(t, itemsConfig)

  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={true}
      getRowId={(row) => row.id}
      onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
      onRowClick={(row) => navigate(`/inventories/${id}/items/${row.id}`)}
    />
  )
}
