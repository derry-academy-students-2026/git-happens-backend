/*
  Warnings:

  - A unique constraint covering the columns `[bandName]` on the table `Band` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[capabilityName]` on the table `Capability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Band_bandName_key" ON "Band"("bandName");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_capabilityName_key" ON "Capability"("capabilityName");
