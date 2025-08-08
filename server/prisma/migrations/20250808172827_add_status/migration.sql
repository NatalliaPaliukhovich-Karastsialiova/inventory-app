-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('active', 'blocked');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatarFallback" TEXT,
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'active';
