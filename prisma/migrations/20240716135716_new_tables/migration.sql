/*
  Warnings:

  - You are about to drop the column `acronisId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "acronisId",
ADD COLUMN     "acronisTenantId" TEXT,
ADD COLUMN     "partnerId" TEXT;

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "acronisId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "acronisId" TEXT,
    "billingDate" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "typeSerialNo" TEXT NOT NULL,
    "licenseSerialNo" TEXT NOT NULL,
    "boughtAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appliance" (
    "id" TEXT NOT NULL,
    "companyType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxNo" TEXT NOT NULL,
    "taxOffice" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "acceptedBy" TEXT NOT NULL,

    CONSTRAINT "Appliance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_acronisId_key" ON "Partner"("acronisId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_acronisId_key" ON "Client"("acronisId");

-- CreateIndex
CREATE UNIQUE INDEX "License_key_key" ON "License"("key");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseSerialNo_key" ON "License"("licenseSerialNo");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
