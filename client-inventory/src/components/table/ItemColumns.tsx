import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomField, Item } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


export function getColumns(
  t: (key: string) => string,
  items: CustomField[]
): ColumnDef<Item>[] {
  const dynamic = items
    .filter((field) => field.showInTable)
    .map((field) => ({
      accessorKey: field.id,
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {field.label}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const fieldValue = row.original.fieldValues.find(
          (fv: any) => fv.field.id === field.id
        );
        if (field.type === "link" && fieldValue?.value) {
          return (
            <a
              href={fieldValue.value}
              target="_blank"
              className="flex items-center gap-2"
            >
              <Avatar className="h-20 w-20 rounded-xl object-fit">
                <AvatarImage src={fieldValue.value} alt={field.label} />
                <AvatarFallback>
                  {field.label.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </a>
          );
        }

        return <span>{fieldValue?.value ?? ""}</span>;
      }
    }));

  const staticColsBeginning: ColumnDef<Item>[] = [
    {
      accessorKey: "customId",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.id")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => <span>{row.original.customId}</span>
    }
  ];

  const staticColsEnd: ColumnDef<Item>[] = [
    {
      accessorKey: "_count.likes",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          className="text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.likes")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => <span>{row.original._count?.likes ?? 0}</span>
    }
  ];

  return [...staticColsBeginning, ...dynamic, ...staticColsEnd];
}
