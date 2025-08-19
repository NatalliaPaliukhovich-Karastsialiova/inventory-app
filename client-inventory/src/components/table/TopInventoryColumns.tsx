import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface TopInventory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  _count: {
    item: number;
  };
}

export function getTopColumns(t: (key: string) => string): ColumnDef<TopInventory>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('inventory.title')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { title, imageUrl } = row.original

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
        )
      },
    },
    {
      accessorKey: "_count.item",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('columns.count')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { item } = row.original._count

        return (
          <div className="text-right font-medium flex gap-3">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{item}</span>
            </div>
          </div>
        )
      },
    },
  ]
}
