import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createInventory,
  fetchInventoryById,
  fetchItemById,
  updateInventory
} from "@/services/api";
import type {
  CustomField,
  Inventory,
  UserAccessList
} from "@/components/table/InventoryColumns";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/store/authStore";
import { ItemForm } from "@/components/inventory/ItemForm";
import type { Item } from "@/components/table/ItemColumns";

export default function ItemPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    async function load() {
      try {
        if (itemId && id) {
          const data = await fetchItemById(itemId as string);
          setItem(data);
          setInventory(data?.inventory);
          setCustomFields(data?.inventory.inventoryField ?? []);
        } else if (!itemId && id) {
          const data = await fetchInventoryById(id as string);
          setInventory(data);
          setCustomFields(data?.inventoryField ?? []);
        }
      } catch (error) {
        toast.error("Failed to load inventory");
      }
    }
    load();
  }, [itemId]);

  return (
    <DashboardLayout>
      <div className="container mx-auto pt-1 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventories">Inventories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/inventories/${inventory?.id}`}>
                {inventory?.title || "Inventory"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{"Item"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {customFields.length > 0 && (
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-10">
            <ItemForm
              templateFields={customFields}
              inventoryId={inventory?.id as string}
              readOnly={!(item?.writeAccess || inventory?.writeAccess)}
              item={item}
              setItem={setItem}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
