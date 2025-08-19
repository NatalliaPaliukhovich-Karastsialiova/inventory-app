import {
  Role,
  Status,
  Provider,
  InventoryCategory,
  FieldType,
  IdSeqType
} from "@prisma/client";

export const codeLists = {
  roles: Object.values(Role),
  statuses: Object.values(Status),
  providers: Object.values(Provider),
  categories: Object.values(InventoryCategory),
  fieldTypes: Object.values(FieldType),
  idSeqTypes: Object.values(IdSeqType)
};
