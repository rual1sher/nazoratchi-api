/*
  Warnings:

  - You are about to drop the column `avatar` on the `worker` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `worker` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `worker` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `worker` table. All the data in the column will be lost.
  - The `role` column on the `worker` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `user_id` to the `worker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'worker');

-- CreateEnum
CREATE TYPE "worker_role" AS ENUM ('worker', 'maneger');

-- AlterTable
ALTER TABLE "worker" DROP COLUMN "avatar",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "phone",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "worker_role" NOT NULL DEFAULT 'worker';

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "avatar" VARCHAR(255),
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(100) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'worker',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
