/*
  Warnings:

  - You are about to drop the column `coordinates` on the `filial` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `day` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `filial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `penalties_name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `penalty` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `penalty` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `salary` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `salary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `worker_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "attendance_type" AS ENUM ('at_work', 'left_work', 'penalty');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('income', 'bonus', 'penalty');

-- CreateEnum
CREATE TYPE "penalty_type" AS ENUM ('late_arrival', 'early_leave', 'no_exit', 'not_arrive');

-- CreateEnum
CREATE TYPE "salary_type" AS ENUM ('month', 'day', 'hours');

-- AlterTable
CREATE SEQUENCE attendance_id_seq;
ALTER TABLE "attendance" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('attendance_id_seq'),
DROP COLUMN "type",
ADD COLUMN     "type" "attendance_type" NOT NULL;
ALTER SEQUENCE attendance_id_seq OWNED BY "attendance"."id";

-- AlterTable
CREATE SEQUENCE company_id_seq;
ALTER TABLE "company" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('company_id_seq');
ALTER SEQUENCE company_id_seq OWNED BY "company"."id";

-- AlterTable
CREATE SEQUENCE day_id_seq;
ALTER TABLE "day" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('day_id_seq');
ALTER SEQUENCE day_id_seq OWNED BY "day"."id";

-- AlterTable
CREATE SEQUENCE department_id_seq;
ALTER TABLE "department" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('department_id_seq');
ALTER SEQUENCE department_id_seq OWNED BY "department"."id";

-- AlterTable
CREATE SEQUENCE filial_id_seq;
ALTER TABLE "filial" DROP COLUMN "coordinates",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('filial_id_seq');
ALTER SEQUENCE filial_id_seq OWNED BY "filial"."id";

-- AlterTable
CREATE SEQUENCE payment_id_seq;
ALTER TABLE "payment" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('payment_id_seq'),
DROP COLUMN "type",
ADD COLUMN     "type" "payment_type" NOT NULL;
ALTER SEQUENCE payment_id_seq OWNED BY "payment"."id";

-- AlterTable
CREATE SEQUENCE penalties_name_id_seq;
ALTER TABLE "penalties_name" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('penalties_name_id_seq');
ALTER SEQUENCE penalties_name_id_seq OWNED BY "penalties_name"."id";

-- AlterTable
CREATE SEQUENCE penalty_id_seq;
ALTER TABLE "penalty" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('penalty_id_seq'),
DROP COLUMN "type",
ADD COLUMN     "type" "penalty_type" NOT NULL;
ALTER SEQUENCE penalty_id_seq OWNED BY "penalty"."id";

-- AlterTable
CREATE SEQUENCE position_id_seq;
ALTER TABLE "position" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('position_id_seq');
ALTER SEQUENCE position_id_seq OWNED BY "position"."id";

-- AlterTable
CREATE SEQUENCE salary_id_seq;
ALTER TABLE "salary" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('salary_id_seq'),
DROP COLUMN "type",
ADD COLUMN     "type" "salary_type" NOT NULL;
ALTER SEQUENCE salary_id_seq OWNED BY "salary"."id";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "avatar" SET DATA TYPE TEXT;

-- AlterTable
CREATE SEQUENCE worker_id_seq;
ALTER TABLE "worker" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('worker_id_seq');
ALTER SEQUENCE worker_id_seq OWNED BY "worker"."id";

-- AlterTable
CREATE SEQUENCE worker_schedule_id_seq;
ALTER TABLE "worker_schedule" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('worker_schedule_id_seq');
ALTER SEQUENCE worker_schedule_id_seq OWNED BY "worker_schedule"."id";

-- CreateTable
CREATE TABLE "coordinate" (
    "id" SERIAL NOT NULL,
    "coordinate" DOUBLE PRECISION[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "filial_id" INTEGER NOT NULL,

    CONSTRAINT "coordinate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coordinate" ADD CONSTRAINT "coordinate_filial_id_foreign" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
