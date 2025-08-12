-- CreateTable
CREATE TABLE "public"."InventoryMessage" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryMessage_inventoryId_idx" ON "public"."InventoryMessage"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryMessage_userId_idx" ON "public"."InventoryMessage"("userId");

-- AddForeignKey
ALTER TABLE "public"."InventoryMessage" ADD CONSTRAINT "InventoryMessage_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMessage" ADD CONSTRAINT "InventoryMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
