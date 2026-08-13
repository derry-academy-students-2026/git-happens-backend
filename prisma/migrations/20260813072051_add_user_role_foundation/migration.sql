-- CreateTable
CREATE TABLE "UserRole" (
    "roleId" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_roleName_key" ON "UserRole"("roleName");

-- Seed baseline roles once so both login and registration can rely on them.
INSERT INTO "UserRole" ("roleName") VALUES ('user'), ('admin')
ON CONFLICT ("roleName") DO NOTHING;

-- Add role support to an existing User table when present.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
    ) THEN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" INTEGER;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

        UPDATE "User"
        SET "roleId" = (SELECT "roleId" FROM "UserRole" WHERE "roleName" = 'user')
        WHERE "roleId" IS NULL;

        ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;
    ELSE
        CREATE TABLE "User" (
            "id" SERIAL NOT NULL,
            "email" TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL,
            "roleId" INTEGER NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'User_roleId_fkey'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
        FOREIGN KEY ("roleId") REFERENCES "UserRole"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
