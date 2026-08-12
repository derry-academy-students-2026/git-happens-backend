/*
  Warnings:

  - The primary key for the `Band` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nameId` on the `Band` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobRole" DROP CONSTRAINT "JobRole_bandId_fkey";

-- AlterTable
ALTER TABLE "Band" DROP CONSTRAINT "Band_pkey",
DROP COLUMN "nameId",
ADD COLUMN     "bandId" SERIAL NOT NULL,
ADD CONSTRAINT "Band_pkey" PRIMARY KEY ("bandId");

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("bandId") ON DELETE RESTRICT ON UPDATE CASCADE;
