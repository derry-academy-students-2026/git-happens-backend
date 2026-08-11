/*
  Warnings:

  - Changed the type of `capabilityId` on the `JobRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "capabilityId",
ADD COLUMN     "capabilityId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("capabilityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("nameId") ON DELETE RESTRICT ON UPDATE CASCADE;
