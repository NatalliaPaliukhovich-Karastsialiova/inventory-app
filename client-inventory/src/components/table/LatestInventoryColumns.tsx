import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Inventory } from "@/types";

export function getColumns(t: (key: string) => string): ColumnDef<Inventory>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("inventory.title")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { title, imageUrl } = row.original;

        return (
          <div className="text-right font-medium flex gap-3">
            <Avatar className="rounded-lg">
              <AvatarImage src={imageUrl} />
              <AvatarFallback>{"?"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{title}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "owner",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("inventory.owner")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { fullName, avatar, email } = row.original.owner;

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
                {email}
              </span>
            </div>
          </div>
        );
      }
    }
  ];
}
