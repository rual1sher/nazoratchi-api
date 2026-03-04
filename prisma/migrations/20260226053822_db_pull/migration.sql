/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "attendance" (
    "id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME(0),
    "type" VARCHAR(255) NOT NULL,
    "worker_id" INTEGER NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day" (
    "id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filial" (
    "id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "coordinates" DOUBLE PRECISION[],
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "filial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" INTEGER NOT NULL,
    "amount" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "comment" TEXT,
    "worker_id" INTEGER NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalties_name" (
    "id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "penalties_name_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalty" (
    "id" INTEGER NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "time" TIME(0) NOT NULL,
    "amount" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,
    "penalties_name_id" INTEGER NOT NULL,

    CONSTRAINT "penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position" (
    "id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary" (
    "id" INTEGER NOT NULL,
    "amount" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "date_time" TIMESTAMPTZ(0) NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "salary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker" (
    "id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "department_id" INTEGER,
    "day_id" INTEGER,
    "position_id" INTEGER,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),

    CONSTRAINT "worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_schedule" (
    "id" INTEGER NOT NULL,
    "day" DATE NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "break_start" TIME(0) NOT NULL,
    "break_end" TIME(0) NOT NULL,
    "day_id" INTEGER NOT NULL,

    CONSTRAINT "worker_schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_worker_id_foreign" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "filial" ADD CONSTRAINT "filial_company_id_foreign" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_worker_id_foreign" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penalty" ADD CONSTRAINT "penalty_penalties_name_id_foreign" FOREIGN KEY ("penalties_name_id") REFERENCES "penalties_name"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "salary" ADD CONSTRAINT "salary_worker_id_foreign" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_company_id_foreign" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_day_id_foreign" FOREIGN KEY ("day_id") REFERENCES "day"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_department_id_foreign" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_position_id_foreign" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker_schedule" ADD CONSTRAINT "worker_schedule_day_id_foreign" FOREIGN KEY ("day_id") REFERENCES "day"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
