-- DropForeignKey
ALTER TABLE "public"."CustomIdElement" DROP CONSTRAINT "CustomIdElement_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryAccess" DROP CONSTRAINT "InventoryAccess_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryField" DROP CONSTRAINT "InventoryField_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryMessage" DROP CONSTRAINT "InventoryMessage_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryTagOnItem" DROP CONSTRAINT "InventoryTagOnItem_inventoryId_fkey";

-- AddForeignKey
ALTER TABLE "public"."InventoryTagOnItem" ADD CONSTRAINT "InventoryTagOnItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryAccess" ADD CONSTRAINT "InventoryAccess_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryField" ADD CONSTRAINT "InventoryField_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomIdElement" ADD CONSTRAINT "CustomIdElement_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMessage" ADD CONSTRAINT "InventoryMessage_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
