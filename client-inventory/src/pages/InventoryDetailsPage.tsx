import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createInventory, fetchInventoryById, updateInventory } from "@/services/api";
import type { Inventory, UserAccessList } from "@/components/table/InventoryColumns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Items } from "@/components/inventory/Items";
import { useAuthStore } from "@/store/authStore";
import { Settings } from "@/components/inventory/Settings";
import { CustomIDBuilder, type CustomIDField } from "@/components/inventory/CustomIDBuilder";
import { InventoryFieldBuilder, type CustomField } from "@/components/inventory/InventoryFieldBuilder";
import UserAccessTable from "@/components/inventory/UserAccessTable";
import Chat from "@/components/inventory/Chat";
import { ItemForm } from "@/components/inventory/ItemForm";

export default function InventoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [customIDFields, setCustomIDFields] = useState<CustomIDField[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [accessList, setAccessList] = useState<UserAccessList[]>([]);
  const [accessListStr, setAccessListStr] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const user = useAuthStore.getState().user

  useEffect(() => {
    async function load() {
      try {
        if(id){
          const data = await fetchInventoryById(id as string);
          setInventory(data);
          setCustomIDFields(data?.customIdElements ?? [])
          setCustomFields(data?.inventoryField ?? [])
          setAccessList(data?.accessList ?? [])
        }else{
          const inst: Inventory = {
            isPublic: false,
            title: 'New Inventory',
            category: '',
            description: '',
            id: '',
            imageUrl: '',
            createdAt: '',
            owner: {
              avatar: '',
              createdAt: '',
              email: '',
              fullName: '',
              id: '',
              status: 'active'
            }
          }
          setInventory(inst);
        }
      } catch (error) {
        toast.error("Failed to load inventory");
      }
    }
    load();
  }, [id]);

  async function handleGlobalSave() {
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (inventory !== null && inventory !== undefined) {
        if (customIDFields) inventory.customIdElements = customIDFields;
        if (customFields) inventory.inventoryField = customFields;
        if (accessListStr) inventory.accessList = accessList;

        if (inventory?.id) {
          await updateInventory(inventory.id, inventory);
          toast.success("Inventory updated");
        } else {
          const created = await createInventory(inventory);
          toast.success("Inventory created");
          navigate(`/inventories/${created.id}`);
        }
      }
    } catch (error) {
      toast.error("Failed to save inventory");
    } finally {
      setIsSaving(false);
    }
  }

  return (
  <DashboardLayout>
    <div className="container mx-auto pt-1 space-y-4">
      <Breadcrumb>
        <BreadcrumbList className="flex flex-wrap gap-1 text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventories">Inventories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{inventory?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{inventory?.title}</h1>
        <Button onClick={handleGlobalSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList
  className="grid grid-cols-2 sm:flex sm:flex-wrap w-full gap-2 h-auto !overflow-visible"
  style={{ minHeight: "auto" }}
>
          <TabsTrigger value="items" className="flex-1 min-w-[100px]">Items</TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 min-w-[100px]">Discussion</TabsTrigger>
          {user && (
            <>
              <TabsTrigger value="settings" className="flex-1 min-w-[100px]">Settings</TabsTrigger>
              <TabsTrigger value="custom_id" className="flex-1 min-w-[100px]">Custom ID</TabsTrigger>
              <TabsTrigger value="fields" className="flex-1 min-w-[100px]">Fields</TabsTrigger>
              <TabsTrigger value="access" className="flex-1 min-w-[100px]">Access</TabsTrigger>
              <TabsTrigger value="stats" className="flex-1 min-w-[100px]">Statistics</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="items">
          <div className="flex w-full justify-end my-2">
            <Button
              onClick={() => navigate(`/inventories/${id}/items/new`)}
              className="w-full sm:w-auto"
            >
              Create
            </Button>
          </div>
          <Items itemsConfig={customFields} />
        </TabsContent>

        <TabsContent value="chat">
          <Chat inventoryId={inventory?.id as string} />
        </TabsContent>

        <TabsContent value="settings">
          <Settings
            inventory={inventory}
            setInventory={setInventory}
          />
        </TabsContent>

        <TabsContent value="custom_id">
          <div className="bg-muted/50 min-h-[60vh] sm:min-h-min flex-1 rounded-xl p-4 sm:p-10">
            <CustomIDBuilder initialFields={customIDFields} onChange={setCustomIDFields} />
          </div>
        </TabsContent>

        <TabsContent value="fields">
          <div className="bg-muted/50 min-h-[60vh] sm:min-h-min flex-1 rounded-xl p-4 sm:p-10">
            <InventoryFieldBuilder initialFields={customFields} onChange={setCustomFields} />
          </div>
        </TabsContent>

        <TabsContent value="access">
          <div className="min-h-[60vh] sm:min-h-min flex-1 rounded-xl p-4 sm:p-10">
            <UserAccessTable initialUsers={accessList} onChange={setAccessList} />
          </div>
        </TabsContent>

        <TabsContent value="stats"></TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
);

}
