-- CreateEnum
CREATE TYPE "task_priority" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "col" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "row" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "file" VARCHAR(500);

-- Migrate priority from INTEGER to task_priority
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "priority_new" "task_priority" NOT NULL DEFAULT 'medium';

UPDATE "task"
SET "priority_new" = CASE
  WHEN "priority" = 1 THEN 'low'::"task_priority"
  WHEN "priority" = 3 THEN 'high'::"task_priority"
  ELSE 'medium'::"task_priority"
END
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'task' AND column_name = 'priority' AND data_type = 'integer'
);

ALTER TABLE "task" DROP COLUMN IF EXISTS "priority";
ALTER TABLE "task" RENAME COLUMN "priority_new" TO "priority";
