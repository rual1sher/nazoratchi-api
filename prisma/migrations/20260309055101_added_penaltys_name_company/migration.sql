/*
  Warnings:

  - You are about to drop the column `time` on the `penalty` table. All the data in the column will be lost.
  - Added the required column `company_id` to the `penalties_name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `penalty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "penalties_name" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "penalty" DROP COLUMN "time",
ADD COLUMN     "date" TIMESTAMPTZ NOT NULL;

-- AddForeignKey
ALTER TABLE "penalties_name" ADD CONSTRAINT "penalties_name_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
