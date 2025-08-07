-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
