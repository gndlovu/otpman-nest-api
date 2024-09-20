/*
  Warnings:

  - You are about to drop the column `isExpired` on the `Otp` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "isExpired",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
