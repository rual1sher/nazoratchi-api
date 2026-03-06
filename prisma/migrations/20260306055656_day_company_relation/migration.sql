/*
  Warnings:

  - Added the required column `company_id` to the `day` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "day" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "day" ADD CONSTRAINT "day_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
