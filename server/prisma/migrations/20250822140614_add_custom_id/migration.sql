/*
  Warnings:

  - A unique constraint covering the columns `[inventoryId,customId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customId` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Item" ALTER COLUMN "customId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_inventoryId_customId_key" ON "public"."Item"("inventoryId", "customId");
