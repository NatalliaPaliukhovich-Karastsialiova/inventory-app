import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInventories } from "@/services/api"; // создадим этот метод
import type { Inventory } from "@/components/table/InventoryColumns";
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

export default function InventoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const user = useAuthStore.getState().user
/*
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await fetchInventories(id);
        setInventory(data);
      } catch (error) {
        toast.error("Failed to load inventory");
      }
    }
    load();
  }, [id]);
*/
  if (inventory) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-1 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventories">Inventories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventory Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold">{"inventory.title"}</h1>
        <p className="text-gray-600">{"No description"}</p>

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
          <TabsContent value="chat">Change your password here.</TabsContent>
            <TabsContent value="settings">Make changes to your account here.</TabsContent>
            <TabsContent value="custom_id">Change your password here.</TabsContent>
            <TabsContent value="fields">Make changes to your account here.</TabsContent>
            <TabsContent value="access">Change your password here.</TabsContent>
            <TabsContent value="stats">Make changes to your account here.</TabsContent>
            <TabsContent value="export">Change your password here.</TabsContent>
          </Tabs>
      </div>
    </DashboardLayout>
  );
}
