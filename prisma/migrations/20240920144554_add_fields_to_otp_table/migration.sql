/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Otp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "expiresAt",
ADD COLUMN     "isExpired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "resentCount" SET DEFAULT 0;
