import { DataTable } from "../table/DataTable";
import { useEffect, useState } from "react";
import { getColumns } from "../table/ItemColumns";
import type { CustomField, Item } from "@/types";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { fetchItems } from "@/services/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface ItemsProps {
  itemsConfig?: CustomField[];
}

export function Items({ itemsConfig = [] }: ItemsProps) {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const result = await fetchItems(id as string);
        setData(result);
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
    getData();
  }, []);

  useEffect(() => {
    const onSearch = (e: any) =>
      setSearch((e as CustomEvent<string>).detail || "");
    const onReload = () => {
      (async () => {
        try {
          const result = await fetchItems(id as string);
          setData(result);
        } catch {}
      })();
    };
    window.addEventListener("inventory-items-search" as any, onSearch as any);
    window.addEventListener("inventory-items-reload" as any, onReload as any);
    return () => {
      window.removeEventListener(
        "inventory-items-search" as any,
        onSearch as any
      );
      window.removeEventListener(
        "inventory-items-reload" as any,
        onReload as any
      );
    };
  }, [id]);

  const columns: any = [
    {
      id: "select",
      header: ({ table }: any) => (
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label={t("table.columns.userAccess.selectAll")}
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("table.columns.userAccess.selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    ...getColumns(t, itemsConfig)
  ];

  return (
    <div className="flex-1 overflow-auto">
      <DataTable
        columns={columns}
        data={data.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
        )}
        showPagination={true}
        getRowId={(row) => row.id}
        onSelectionChange={(ids: string[]) => {
          window.dispatchEvent(
            new CustomEvent(
              "inventory-items-selection" as any,
              { detail: ids } as any
            )
          );
        }}
        onRowClick={(row) => navigate(`/inventories/${id}/items/${row.id}`)}
      />
    </div>
  );
}
