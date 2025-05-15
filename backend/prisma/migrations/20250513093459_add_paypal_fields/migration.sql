-- AlterTable
ALTER TABLE "billing_record" ADD COLUMN     "paypalOrderId" TEXT;

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPaymentAmount" DOUBLE PRECISION,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paypalOrderId" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "billing_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "paypalOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
