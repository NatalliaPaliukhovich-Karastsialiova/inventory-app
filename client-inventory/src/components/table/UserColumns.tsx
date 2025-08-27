import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleX } from "lucide-react";
import type { User } from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function getColumns(t: (key: string) => string): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("table.columns.userAccess.selectAll")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("table.columns.userAccess.selectRow")}
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { fullName, avatar, createdAt } = row.original;
        const createdDate = new Date(createdAt);

        return (
          <div className="text-right font-medium flex gap-3">
            <Avatar className="rounded-lg">
              <AvatarImage src={avatar} />
              <AvatarFallback>
                {fullName?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{fullName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t("common.createdAt")}: {createdDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.email")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.status")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="outline" className="flex items-center gap-2">
            {status === "active" && (
              <CircleCheck className="h-3 w-3 text-green-500" />
            )}
            {status === "blocked" && (
              <CircleX className="h-3 w-3 text-red-500" />
            )}
            {t(`common.${status}`)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.role")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("role") as string;
        return (
          <span className="truncate font-medium">{t(`common.${status}`)}</span>
        );
      }
    }
  ];
}
