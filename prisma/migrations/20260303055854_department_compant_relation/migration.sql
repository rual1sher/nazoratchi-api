/*
  Warnings:

  - Added the required column `compant_id` to the `department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "department" ADD COLUMN     "compant_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_compant_id_fkey" FOREIGN KEY ("compant_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
