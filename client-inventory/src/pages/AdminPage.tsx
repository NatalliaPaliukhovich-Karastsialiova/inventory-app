"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/layouts/DashboardLayout"
import { getColumns } from "@/components/table/UserColumns"
import type { User } from "@/components/table/UserColumns"
import { DataTable } from "@/components/table/DataTable"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { fetchUsers, getProfile, processUsersBatch } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { Navigate, useNavigate } from "react-router-dom"

export default function AdminPage() {
  const [data, setData] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const user = useAuthStore.getState().user;
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchUsers()
        setData(result)
      } catch (error) {
        toast.error(t("common.error"))
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

  const handleAction = async (type: string) => {
    try {
      if (selectedUsers.length === 0) {
        alert(t("common.noSelection"));
        return;
      }
      await processUsersBatch(selectedUsers, type);
      const updatedUsers = await fetchUsers();
      setData(updatedUsers);
      if(selectedUsers.includes(user?.id as string)){
        await getProfile()
        if(type === 'block' || type === 'remove-admin' || type === 'delete'){
          useAuthStore.getState().clearUser();
          navigate('/')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t("common.actionError"));
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("users")}</h2>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("block")}
            >
              {t("block")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("unblock")}
            >
              {t("unblock")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("make-admin")}
            >
              {t("makeAdmin")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("remove-admin")}
            >
              {t("removeAdmin")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("delete")}
            >
              <Trash />
              {t("delete")}
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          showPagination={true}
          onSelectionChange={(ids: string[]) => setSelectedUsers(ids)}
        />
      </div>
    </DashboardLayout>
  )
}
