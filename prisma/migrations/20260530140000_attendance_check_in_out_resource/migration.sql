-- CreateEnum
CREATE TYPE "attendance_resource" AS ENUM ('mobile', 'terminal', 'manual');

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN IF EXISTS "time",
DROP COLUMN IF EXISTS "type",
ADD COLUMN IF NOT EXISTS "check_in_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "check_out_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "resource" "attendance_resource" NOT NULL DEFAULT 'manual';

-- DropEnum (if exists from previous schema)
DROP TYPE IF EXISTS "attendance_type";
