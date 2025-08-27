export type User = {
  id: string;
  email: string;
  status: "active" | "blocked";
  fullName: string;
  avatar: string;
  createdAt: string;
};

export type CustomIdType =
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
  owner: {
    email: string;
    fullName: string;
    avatar?: string;
    avatarFallback?: string;
    createdAt?: string;
    status?: string;
    id?: string;
  };
  ownerId: string;
  description: string;
  createdAt: string;
  imageUrl: string;
  writeAccess?: boolean;
  ownerOrAdmin?: boolean;
  customIdElements?: CustomIdElement[];
  inventoryField?: CustomField[];
  accessList?: UserAccessList[];
  tags?: InventoryTag[];
  version?: number;
  updatedAt?: string;
};

export type ItemFieldValue = {
  id: string;
  fieldId: string;
  value: string;
  field: CustomField;
};

export type Item = {
  id: string;
  customId: string;
  inventoryId: string;
  inventory: Inventory;
  createdAt: string;
  updatedAt: string;
  writeAccess?: boolean;
  ownerOrAdmin?: boolean;
  fieldValues: ItemFieldValue[];
  _count?: { likes: number };
};

export interface CustomIDField {
  id: string;
  type: CustomIdType;
  value?: string;
  separator?: string;
}

export interface TopInventory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  _count: {
    item: number;
  };
}

export type Tag = {
  id: string;
  name: string;
};

export type InventoryTag = {
  tagId?: string;
  inventoryId?: string;
  tag: Tag;
};
