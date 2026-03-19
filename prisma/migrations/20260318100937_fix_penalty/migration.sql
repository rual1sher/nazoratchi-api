/*
  Warnings:

  - You are about to drop the column `time_threshold` on the `penalty` table. All the data in the column will be lost.
  - Added the required column `min_minutes` to the `penalty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "penalty" DROP COLUMN "time_threshold",
ADD COLUMN     "min_minutes" INTEGER NOT NULL;
