-- Rename the legacy status when this database was migrated from the earlier enum.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'ApplicationStatus'
          AND e.enumlabel = 'IN_PROGRESS'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'ApplicationStatus'
          AND e.enumlabel = 'SUBMITTED'
    ) THEN
        ALTER TYPE "ApplicationStatus" RENAME VALUE 'IN_PROGRESS' TO 'SUBMITTED';
    END IF;
END $$;

-- Add lifecycle values missing from older versions of the enum.
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'INTERVIEW';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'OFFERED';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'WITHDRAWN';