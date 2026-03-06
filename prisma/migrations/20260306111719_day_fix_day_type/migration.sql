/*
  Warnings:

  - Changed the type of `day` on the `worker_schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "worker_schedule" DROP COLUMN "day",
ADD COLUMN     "day" INTEGER NOT NULL;
