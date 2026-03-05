/*
  Warnings:

  - You are about to drop the column `title` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `position` table. All the data in the column will be lost.
  - Added the required column `title_en` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ru` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ru` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "department" DROP COLUMN "title",
ADD COLUMN     "title_en" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_ru" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_uz" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "position" DROP COLUMN "title",
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD COLUMN     "title_en" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_ru" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_uz" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
