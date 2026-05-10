-- Связи праздник ↔ филиалы / отделы / типы графика (multi-select)

CREATE TABLE "holiday_filial" (
    "holiday_id" INTEGER NOT NULL,
    "filial_id" INTEGER NOT NULL,

    CONSTRAINT "holiday_filial_pkey" PRIMARY KEY ("holiday_id","filial_id")
);

CREATE INDEX "holiday_filial_filial_id_idx" ON "holiday_filial"("filial_id");

ALTER TABLE "holiday_filial" ADD CONSTRAINT "holiday_filial_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "holiday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holiday_filial" ADD CONSTRAINT "holiday_filial_filial_id_fkey" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "holiday_department" (
    "holiday_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "holiday_department_pkey" PRIMARY KEY ("holiday_id","department_id")
);

CREATE INDEX "holiday_department_department_id_idx" ON "holiday_department"("department_id");

ALTER TABLE "holiday_department" ADD CONSTRAINT "holiday_department_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "holiday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holiday_department" ADD CONSTRAINT "holiday_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "holiday_schedule_scope" (
    "holiday_id" INTEGER NOT NULL,
    "type" "worker_schedule_type" NOT NULL,

    CONSTRAINT "holiday_schedule_scope_pkey" PRIMARY KEY ("holiday_id","type")
);

ALTER TABLE "holiday_schedule_scope" ADD CONSTRAINT "holiday_schedule_scope_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "holiday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'holiday' AND column_name = 'filial_id'
  ) THEN
    INSERT INTO "holiday_filial" ("holiday_id", "filial_id")
    SELECT "id", "filial_id" FROM "holiday" WHERE "filial_id" IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'holiday' AND column_name = 'department_id'
  ) THEN
    INSERT INTO "holiday_department" ("holiday_id", "department_id")
    SELECT "id", "department_id" FROM "holiday" WHERE "department_id" IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'holiday' AND column_name = 'schedule_type'
  ) THEN
    INSERT INTO "holiday_schedule_scope" ("holiday_id", "type")
    SELECT "id", "schedule_type"::"worker_schedule_type" FROM "holiday"
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_filial_id_fkey";
ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_department_id_fkey";
ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_filial_id_foreign";
ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_department_id_foreign";
ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_position_id_fkey";
ALTER TABLE "holiday" DROP CONSTRAINT IF EXISTS "holiday_schedule_id_fkey";

ALTER TABLE "holiday" DROP COLUMN IF EXISTS "filial_id";
ALTER TABLE "holiday" DROP COLUMN IF EXISTS "department_id";
ALTER TABLE "holiday" DROP COLUMN IF EXISTS "schedule_type";
ALTER TABLE "holiday" DROP COLUMN IF EXISTS "position_id";
ALTER TABLE "holiday" DROP COLUMN IF EXISTS "schedule_id";
