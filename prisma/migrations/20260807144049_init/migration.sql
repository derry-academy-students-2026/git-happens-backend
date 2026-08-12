-- CreateTable
CREATE TABLE "JobRole" (
    "jobRoleId" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "bandId" DECIMAL(10,2) NOT NULL,
    "closingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("jobRoleId")
);

-- CreateTable
CREATE TABLE "Capability" (
    "capabilityId" SERIAL NOT NULL,
    "capabilityName" TEXT NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("capabilityId")
);

-- CreateTable
CREATE TABLE "Band" (
    "nameId" SERIAL NOT NULL,
    "bandName" TEXT NOT NULL,

    CONSTRAINT "Band_pkey" PRIMARY KEY ("nameId")
);
