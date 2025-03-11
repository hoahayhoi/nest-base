/*
  Warnings:

  - Added the required column `customer_address` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "customer_address" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_address_fkey" FOREIGN KEY ("customer_address") REFERENCES "user_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
