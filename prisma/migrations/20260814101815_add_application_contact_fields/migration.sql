-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "previousExperience" TEXT;
