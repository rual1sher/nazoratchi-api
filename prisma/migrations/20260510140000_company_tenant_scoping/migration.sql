-- Tenant column `company_id` + FKs (backfill from existing relations where possible).

-- attendance
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "company_id" INTEGER;
UPDATE "attendance" AS a
SET "company_id" = w."company_id"
FROM "worker" AS w
WHERE w."id" = a."worker_id";
UPDATE "attendance" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
WHERE "company_id" IS NULL;
ALTER TABLE "attendance" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "attendance" DROP CONSTRAINT IF EXISTS "attendance_company_id_fkey";
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "attendance_company_id_idx" ON "attendance"("company_id");

-- worker_schedule
ALTER TABLE "worker_schedule" ADD COLUMN IF NOT EXISTS "company_id" INTEGER;
UPDATE "worker_schedule" AS ws
SET "company_id" = sub."cid"
FROM (
  SELECT ws2."id" AS sid, (MIN(w."company_id"))::int AS cid
  FROM "worker_schedule" ws2
  INNER JOIN "worker" w ON w."schedule_id" = ws2."id" AND w."deleted_at" IS NULL
  GROUP BY ws2."id"
) AS sub
WHERE ws."id" = sub.sid;
UPDATE "worker_schedule" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
WHERE "company_id" IS NULL;
ALTER TABLE "worker_schedule" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "worker_schedule" DROP CONSTRAINT IF EXISTS "worker_schedule_company_id_fkey";
ALTER TABLE "worker_schedule" ADD CONSTRAINT "worker_schedule_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "worker_schedule_company_id_idx" ON "worker_schedule"("company_id");

-- holiday
ALTER TABLE "holiday" ADD COLUMN IF NOT EXISTS "company_id" INTEGER;
UPDATE "holiday" AS h
SET "company_id" = f."company_id"
FROM "filial" AS f
WHERE h."filial_id" IS NOT NULL AND f."id" = h."filial_id";
UPDATE "holiday" AS h
SET "company_id" = d."company_id"
FROM "department" AS d
WHERE h."company_id" IS NULL AND h."department_id" IS NOT NULL AND d."id" = h."department_id";
UPDATE "holiday" AS h
SET "company_id" = dep."company_id"
FROM "position" AS pos
INNER JOIN "department" AS dep ON dep."id" = pos."department_id"
WHERE h."company_id" IS NULL AND h."position_id" IS NOT NULL AND pos."id" = h."position_id";
UPDATE "holiday" AS h
SET "company_id" = sub."cid"
FROM (
  SELECT h2."id" AS hid, (MIN(w."company_id"))::int AS cid
  FROM "holiday" h2
  INNER JOIN "worker" w ON w."schedule_id" = h2."schedule_id" AND w."deleted_at" IS NULL
  WHERE h2."schedule_id" IS NOT NULL
  GROUP BY h2."id"
) AS sub
WHERE h."id" = sub.hid AND h."company_id" IS NULL;
UPDATE "holiday" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
WHERE "company_id" IS NULL;
ALTER TABLE "holiday" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_company_id_fkey";
ALTER TABLE "holiday" ADD CONSTRAINT "holiday_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "holiday_company_id_idx" ON "holiday"("company_id");

-- payment
ALTER TABLE "payment" ADD COLUMN IF NOT EXISTS "company_id" INTEGER;
UPDATE "payment" AS p
SET "company_id" = w."company_id"
FROM "worker" AS w
WHERE w."id" = p."worker_id";
UPDATE "payment" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
WHERE "company_id" IS NULL;
ALTER TABLE "payment" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "payment_company_id_fkey";
ALTER TABLE "payment" ADD CONSTRAINT "payment_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "payment_company_id_idx" ON "payment"("company_id");

-- salary
ALTER TABLE "salary" ADD COLUMN IF NOT EXISTS "company_id" INTEGER;
UPDATE "salary" AS s
SET "company_id" = w."company_id"
FROM "worker" AS w
WHERE w."id" = s."worker_id";
UPDATE "salary" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
WHERE "company_id" IS NULL;
ALTER TABLE "salary" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "salary" DROP CONSTRAINT IF EXISTS "salary_company_id_fkey";
ALTER TABLE "salary" ADD CONSTRAINT "salary_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "salary_company_id_idx" ON "salary"("company_id");

-- penalty
ALTER TABLE "penalty" ADD COLUMN IF NOT EXISTS "company_id" INTEGER;
UPDATE "penalty" AS p
SET "company_id" = pn."company_id"
FROM "penalties_name" AS pn
WHERE pn."id" = p."penalties_name_id";
UPDATE "penalty" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
WHERE "company_id" IS NULL;
ALTER TABLE "penalty" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "penalty" DROP CONSTRAINT IF EXISTS "penalty_company_id_fkey";
ALTER TABLE "penalty" ADD CONSTRAINT "penalty_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "penalty_company_id_idx" ON "penalty"("company_id");

-- task (table may exist without rows; join table name follows Prisma implicit M-N)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'task'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'task' AND column_name = 'company_id'
    ) THEN
      ALTER TABLE "task" ADD COLUMN "company_id" INTEGER;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = '_taskToworker'
    ) THEN
      EXECUTE $u$
        UPDATE "task" AS t
        SET "company_id" = w."company_id"
        FROM "_taskToworker" AS m
        INNER JOIN "worker" AS w ON w."id" = m."B"
        WHERE m."A" = t."id" AND t."company_id" IS NULL
      $u$;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = '_TaskToWorker'
    ) THEN
      EXECUTE $u$
        UPDATE "task" AS t
        SET "company_id" = w."company_id"
        FROM "_TaskToWorker" AS m
        INNER JOIN "worker" AS w ON w."id" = m."B"
        WHERE m."A" = t."id" AND t."company_id" IS NULL
      $u$;
    END IF;

    UPDATE "task" SET "company_id" = (SELECT "id" FROM "company" ORDER BY "id" ASC LIMIT 1)
    WHERE "company_id" IS NULL;

    ALTER TABLE "task" ALTER COLUMN "company_id" SET NOT NULL;
    ALTER TABLE "task" DROP CONSTRAINT IF EXISTS "task_company_id_fkey";
    ALTER TABLE "task" ADD CONSTRAINT "task_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
    CREATE INDEX IF NOT EXISTS "task_company_id_idx" ON "task"("company_id");
  END IF;
END $$;
