/*
  Warnings:

  - You are about to drop the column `time` on the `Job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WageStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('CHECKED_OUT', 'RETURNED', 'LOST');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TRANSPORT', 'FOOD', 'FUEL', 'EQUIPMENT_RENTAL', 'MISC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "InvoiceStatus" ADD VALUE 'APPROVED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobStatus" ADD VALUE 'PLANNED';
ALTER TYPE "JobStatus" ADD VALUE 'ONGOING';

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_eventId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_itemId_fkey";

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "regNumber" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "supportEmail" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "jobId" TEXT,
ALTER COLUMN "eventId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "description" TEXT,
ALTER COLUMN "itemId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "time";

-- AlterTable
ALTER TABLE "PaymentProfile" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "branch" TEXT;

-- AlterTable
ALTER TABLE "Wage" ADD COLUMN     "breakdown" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "status" "WageStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "workingDayStart" TEXT NOT NULL DEFAULT '09:00',
    "workingDayEnd" TEXT NOT NULL DEFAULT '18:00',
    "overtimeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "overtimeThreshold" INTEGER NOT NULL DEFAULT 8,
    "attendanceGracePeriod" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalRoleRate" (
    "id" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "wageType" "WageType" NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalRoleRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequest" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "checkedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "status" "CheckoutStatus" NOT NULL DEFAULT 'CHECKED_OUT',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobExpense" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'MISC',
    "description" TEXT,
    "proofUrl" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_companyId_key" ON "SystemSettings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalRoleRate_roleName_wageType_key" ON "GlobalRoleRate"("roleName", "wageType");

-- CreateIndex
CREATE UNIQUE INDEX "JobRequest_jobId_employeeId_key" ON "JobRequest"("jobId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_jobId_key" ON "Invoice"("jobId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wage" ADD CONSTRAINT "Wage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutLog" ADD CONSTRAINT "CheckoutLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutLog" ADD CONSTRAINT "CheckoutLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutLog" ADD CONSTRAINT "CheckoutLog_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobExpense" ADD CONSTRAINT "JobExpense_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobExpense" ADD CONSTRAINT "JobExpense_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
