-- AlterTable
ALTER TABLE "usage" ADD COLUMN     "is_tracking_previous_month" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previous_month_accumulated" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
