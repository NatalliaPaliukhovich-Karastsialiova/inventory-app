/*
  Warnings:

  - A unique constraint covering the columns `[itemId,fieldId]` on the table `ItemFieldValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ItemFieldValue_itemId_fieldId_key" ON "public"."ItemFieldValue"("itemId", "fieldId");
