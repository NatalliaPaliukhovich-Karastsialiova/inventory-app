-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('single_line_text', 'multi_line_text', 'number', 'link', 'boolean');

-- CreateEnum
CREATE TYPE "public"."IdSeqType" AS ENUM ('fixed', 'guid', 'date', 'seq', 'rand6', 'rand9', 'rand20', 'rand32');

-- CreateTable
CREATE TABLE "public"."InventoryField" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."FieldType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "showInTable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomIdElement" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" "public"."IdSeqType" NOT NULL,
    "value" TEXT NOT NULL,
    "separator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomIdElement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InventoryField" ADD CONSTRAINT "InventoryField_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomIdElement" ADD CONSTRAINT "CustomIdElement_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
