-- DropForeignKey
ALTER TABLE "worker" DROP CONSTRAINT "worker_user_id_fkey";

-- AlterTable
ALTER TABLE "worker" ADD COLUMN     "filial_id" INTEGER;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_filial_id_fkey" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
