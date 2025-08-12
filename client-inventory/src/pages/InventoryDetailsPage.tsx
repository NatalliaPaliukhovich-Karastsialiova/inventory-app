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
import type { InventorySettingSchema } from "@/lib/inventory";
import { CustomIDBuilder, type CustomIDField } from "@/components/inventory/CustomIDBuilder";
import { InventoryFieldBuilder, type CustomField } from "@/components/inventory/InventoryFieldBuilder";
import UserAccessTable from "@/components/inventory/UserAccessTable";
import Chat from "@/components/inventory/Chat";

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
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventories">Inventories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{inventory?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{inventory?.title}</h1>
          <Button onClick={handleGlobalSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="flex w-full">
            <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            {user && (
              <>
                <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                <TabsTrigger value="custom_id" className="flex-1">Custom ID</TabsTrigger>
                <TabsTrigger value="fields" className="flex-1">Fields</TabsTrigger>
                <TabsTrigger value="access" className="flex-1">Access</TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
                <TabsTrigger value="export" className="flex-1">Export</TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value="items">
            <Items/>
          </TabsContent>
          <TabsContent value="chat">
            <Chat inventoryId={inventory?.id as string}/>
          </TabsContent>
          <TabsContent value="settings">
            <Settings
              inventory={inventory}
              setInventory={setInventory}
            />
          </TabsContent>
          <TabsContent value="custom_id">
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-10">
              <CustomIDBuilder initialFields={customIDFields} onChange={setCustomIDFields}/>
            </div>
          </TabsContent>
          <TabsContent value="fields">
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-10">
              <InventoryFieldBuilder initialFields={customFields} onChange={setCustomFields} />
            </div>
          </TabsContent>
          <TabsContent value="access">
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-10">
              <UserAccessTable initialUsers={accessList} onChange={setAccessList} />
            </div>
          </TabsContent>
          <TabsContent value="stats"></TabsContent>
          <TabsContent value="export"></TabsContent>
          </Tabs>
      </div>
    </DashboardLayout>
  );
}
