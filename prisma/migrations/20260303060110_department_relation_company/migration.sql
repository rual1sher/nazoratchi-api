/*
  Warnings:

  - You are about to drop the column `compant_id` on the `department` table. All the data in the column will be lost.
  - Added the required column `company_id` to the `department` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "department" DROP CONSTRAINT "department_compant_id_fkey";

-- AlterTable
ALTER TABLE "department" DROP COLUMN "compant_id",
ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
