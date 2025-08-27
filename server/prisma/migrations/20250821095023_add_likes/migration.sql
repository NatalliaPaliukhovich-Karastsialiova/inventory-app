-- CreateTable
CREATE TABLE "public"."ItemLike" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemLike_itemId_idx" ON "public"."ItemLike"("itemId");

-- CreateIndex
CREATE INDEX "ItemLike_userId_idx" ON "public"."ItemLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemLike_itemId_userId_key" ON "public"."ItemLike"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "public"."ItemLike" ADD CONSTRAINT "ItemLike_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemLike" ADD CONSTRAINT "ItemLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
