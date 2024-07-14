-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;
