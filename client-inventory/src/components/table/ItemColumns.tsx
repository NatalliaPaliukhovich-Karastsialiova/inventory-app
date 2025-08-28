import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomField, Item } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FileText, Image } from "lucide-react";

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
          const href: string = fieldValue.value;
          const clean = href.split("#")[0].split("?")[0].toLowerCase();
          const isImage = [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".webp",
            ".bmp",
            ".svg"
          ].some((ext) => clean.endsWith(ext));
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                {isImage ? (
                  <Image className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{t("codelists.fieldTypes.link")}</span>
              </Badge>
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
