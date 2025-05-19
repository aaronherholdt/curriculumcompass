/*
  Warnings:

  - You are about to drop the column `lastPaymentAmount` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentDate` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paypalOrderId` on the `subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscriptionId]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionId` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "lastPaymentAmount",
DROP COLUMN "lastPaymentDate",
DROP COLUMN "paymentMethod",
DROP COLUMN "paypalOrderId",
ADD COLUMN     "paypalData" JSONB,
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "subscriptionId" TEXT NOT NULL,
ALTER COLUMN "plan" SET DEFAULT 'Premium',
ALTER COLUMN "price" SET DEFAULT 20.00,
ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paypalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_saleId_key" ON "payment"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_subscriptionId_key" ON "subscription"("subscriptionId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("subscriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;
