/*
  Warnings:

  - You are about to drop the column `email` on the `Otp` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Otp_email_key";

-- DropIndex
DROP INDEX "Otp_pin_key";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "email";
