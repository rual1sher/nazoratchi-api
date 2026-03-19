/*
  Warnings:

  - You are about to drop the column `title` on the `day` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `filial` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `penalties_name` table. All the data in the column will be lost.
  - Added the required column `title_en` to the `day` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ru` to the `day` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `day` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `filial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ru` to the `filial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `filial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `penalties_name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ru` to the `penalties_name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `penalties_name` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "coordinate" DROP CONSTRAINT "coordinate_filial_id_foreign";

-- DropForeignKey
ALTER TABLE "filial" DROP CONSTRAINT "filial_company_id_foreign";

-- DropForeignKey
ALTER TABLE "worker_schedule" DROP CONSTRAINT "worker_schedule_day_id_foreign";

-- AlterTable
ALTER TABLE "day" DROP COLUMN "title",
ADD COLUMN     "title_en" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_ru" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_uz" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "filial" DROP COLUMN "title",
ADD COLUMN     "title_en" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_ru" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_uz" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "penalties_name" DROP COLUMN "title",
ADD COLUMN     "title_en" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_ru" VARCHAR(255) NOT NULL,
ADD COLUMN     "title_uz" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "coordinate" ADD CONSTRAINT "coordinate_filial_id_foreign" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filial" ADD CONSTRAINT "filial_company_id_foreign" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_schedule" ADD CONSTRAINT "worker_schedule_day_id_foreign" FOREIGN KEY ("day_id") REFERENCES "day"("id") ON DELETE SET NULL ON UPDATE CASCADE;
