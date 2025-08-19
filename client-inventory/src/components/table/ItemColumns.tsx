import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Inventory } from "./InventoryColumns";

export type FieldType =
  | "single_line_text"
  | "multi_line_text"
  | "number"
  | "link"
  | "boolean";

export type CustomField = {
  id: string;
  label: string;
  type: FieldType;
  description: string;
  showInTable: boolean;
};

export type ItemFieldValue = {
  id: string;
  fieldId: string;
  value: string;
  field: CustomField;
};

export type Item = {
  id: string;
  inventoryId: string;
  inventory: Inventory;
  createdAt: string;
  updatedAt: string;
  writeAccess?: boolean;
  ownerOrAdmin?: boolean;
  fieldValues: ItemFieldValue[];
};

export function getColumns(
  t: (key: string) => string,
  items: CustomField[]
): ColumnDef<Item>[] {
  return items
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
        return <span>{fieldValue?.value ?? ""}</span>;
      }
    }));
}
