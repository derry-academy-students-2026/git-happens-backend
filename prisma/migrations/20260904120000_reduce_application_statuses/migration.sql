ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";

CREATE TYPE "ApplicationStatus" AS ENUM (
    'IN_PROGRESS',
    'HIRED',
    'REJECTED'
);

ALTER TABLE "JobApplication"
ALTER COLUMN "applicationStatus" DROP DEFAULT,
ALTER COLUMN "applicationStatus" TYPE "ApplicationStatus"
USING (
    CASE "applicationStatus"::text
        WHEN 'OFFERED' THEN 'HIRED'
        WHEN 'REJECTED' THEN 'REJECTED'
        WHEN 'WITHDRAWN' THEN 'REJECTED'
        ELSE 'IN_PROGRESS'
    END::"ApplicationStatus"
),
ALTER COLUMN "applicationStatus" SET DEFAULT 'IN_PROGRESS';

DROP TYPE "ApplicationStatus_old";
