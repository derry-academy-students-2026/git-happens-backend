-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'INTERVIEW',
    'OFFERED',
    'REJECTED',
    'WITHDRAWN'
);

-- Preserve existing applications while replacing the legacy initial status.
UPDATE "JobApplication"
SET "applicationStatus" = 'SUBMITTED'
WHERE "applicationStatus" = 'in progress';

-- AlterTable
ALTER TABLE "JobApplication"
ALTER COLUMN "applicationStatus" DROP DEFAULT,
ALTER COLUMN "applicationStatus" TYPE "ApplicationStatus"
USING ("applicationStatus"::"ApplicationStatus"),
ALTER COLUMN "applicationStatus" SET DEFAULT 'SUBMITTED';
