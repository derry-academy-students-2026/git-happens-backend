/*
  Warnings:

  - You are about to alter the column `bandId` on the `JobRole` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "JobRole" ALTER COLUMN "bandId" SET DATA TYPE INTEGER,
ALTER COLUMN "status" SET DEFAULT 'Open',
ALTER COLUMN "status" SET DATA TYPE TEXT;
