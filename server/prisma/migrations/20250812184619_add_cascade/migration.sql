-- DropForeignKey
ALTER TABLE "public"."Inventory" DROP CONSTRAINT "Inventory_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryAccess" DROP CONSTRAINT "InventoryAccess_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryMessage" DROP CONSTRAINT "InventoryMessage_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryAccess" ADD CONSTRAINT "InventoryAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMessage" ADD CONSTRAINT "InventoryMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
