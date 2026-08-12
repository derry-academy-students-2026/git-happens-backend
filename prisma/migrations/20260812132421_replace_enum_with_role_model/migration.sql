-- CreateTable
CREATE TABLE "userRole" (
    "roleId" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "userRole_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "userRole_roleName_key" ON "userRole"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "userRole"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;
