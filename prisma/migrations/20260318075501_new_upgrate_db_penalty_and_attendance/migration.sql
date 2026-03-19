/*
  Warnings:

  - You are about to drop the column `time` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `penalty` table. All the data in the column will be lost.
  - The `break_start` column on the `worker_schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `break_end` column on the `worker_schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[worker_id,date]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `time_threshold` to the `penalty` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `penalty` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start_time` on the `worker_schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `worker_schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "time",
DROP COLUMN "type",
ADD COLUMN     "arrival_at" TIMESTAMPTZ,
ADD COLUMN     "departure_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "penalty" DROP COLUMN "date",
ADD COLUMN     "time_threshold" TIME NOT NULL,
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "worker_schedule" DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIME NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIME NOT NULL,
DROP COLUMN "break_start",
ADD COLUMN     "break_start" TIME,
DROP COLUMN "break_end",
ADD COLUMN     "break_end" TIME;

-- DropEnum
DROP TYPE "attendance_type";

-- CreateIndex
CREATE UNIQUE INDEX "attendance_worker_id_date_key" ON "attendance"("worker_id", "date");
