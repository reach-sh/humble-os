-- AlterTable
ALTER TABLE "Pool" ADD COLUMN     "duplicate" BOOLEAN DEFAULT false,
ADD COLUMN     "tradeable" BOOLEAN DEFAULT true;
