-- CreateIndex
CREATE INDEX "Inventory_description_idx" ON "public"."Inventory"("description");

-- CreateIndex
CREATE INDEX "Item_customId_idx" ON "public"."Item"("customId");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "public"."Tag"("name");
