import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "./UserColumns";

type CustomIdType =
  | "fixed"
  | "rand20"
  | "rand32"
  | "rand6"
  | "rand9"
  | "date"
  | "seq"
  | "guid";

export type CustomIdElement = {
  id: string;
  type: CustomIdType;
  separator?: string;
  value?: string;
};

type FieldType =
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

export type UserAccessList = {
  userId: string;
  user: {
    email: string;
    fullName: string;
    avatar?: string;
    avatarFallback?: string;
  };
};

export type Inventory = {
  id: string;
  title: string;
  category: string;
  isPublic: boolean;
  owner: User;
  ownerId: string;
  description: string;
  createdAt: string;
  imageUrl: string;
  writeAccess?: boolean;
  ownerOrAdmin?: boolean;
  customIdElements?: CustomIdElement[];
  inventoryField?: CustomField[];
  accessList?: UserAccessList[];
};

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
        const { title, imageUrl, createdAt } = row.original;
        const createdDate = new Date(createdAt);

        return (
          <div className="text-right font-medium flex gap-3">
            <Avatar className="rounded-lg">
              <AvatarImage src={imageUrl} />
              <AvatarFallback>{"?"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t("inventory.createdAt")}: {createdDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className=""
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("inventory.category")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { category } = row.original;

        return (
          <div className="text-left font-medium flex gap-3">
            {t(`inventory.${category}`)}
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
