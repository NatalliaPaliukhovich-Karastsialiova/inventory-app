"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/layouts/DashboardLayout"
import { getColumns } from "@/components/table/Columns"
import type { User } from "@/components/table/Columns"
import { DataTable } from "@/components/table/DataTable"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { fetchUsers } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, RefreshCw } from "lucide-react"

export default function AdminPage() {
  const [data, setData] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchUsers()
        setData(result)
      } catch (error) {
        toast.error("Error:")
      }
    }
    getData()
  }, [])

  const columns = getColumns(t)

  const filteredData = data.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("users")}</h2>
        </div>
        <div className="flex justify-between gap-2">
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("refresh")}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> {t("refresh")}
            </Button>
            <Button size="sm" onClick={() => console.log("add user")}>
              <PlusCircle className="h-4 w-4 mr-2" /> {t("addUser")}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} />
      </div>
    </DashboardLayout>
  )
}
