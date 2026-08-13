/*
  Warnings:

  - You are about to drop the column `status` on the `JobRole` table. All the data in the column will be lost.
  - Added the required column `description` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfOpenPositions` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharepointUrl` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `JobRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "status",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "numberOfOpenPositions" INTEGER NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ADD COLUMN     "sharepointUrl" TEXT NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Status" (
    "statusId" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL DEFAULT 'Open',

    CONSTRAINT "Status_pkey" PRIMARY KEY ("statusId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_statusName_key" ON "Status"("statusName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("statusId") ON DELETE RESTRICT ON UPDATE CASCADE;
