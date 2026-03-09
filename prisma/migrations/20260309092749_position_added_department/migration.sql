/*
  Warnings:

  - You are about to drop the column `company_id` on the `position` table. All the data in the column will be lost.
  - Added the required column `department_id` to the `position` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "position" DROP CONSTRAINT "position_company_id_fkey";

-- DropForeignKey
ALTER TABLE "worker" DROP CONSTRAINT "worker_company_id_foreign";

-- DropForeignKey
ALTER TABLE "worker" DROP CONSTRAINT "worker_day_id_foreign";

-- DropForeignKey
ALTER TABLE "worker" DROP CONSTRAINT "worker_department_id_foreign";

-- DropForeignKey
ALTER TABLE "worker" DROP CONSTRAINT "worker_position_id_foreign";

-- AlterTable
ALTER TABLE "position" DROP COLUMN "company_id",
ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_company_id_foreign" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_day_id_foreign" FOREIGN KEY ("day_id") REFERENCES "day"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_department_id_foreign" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_position_id_foreign" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
