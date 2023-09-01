/*
  Warnings:

  - You are about to drop the column `apr` on the `PoolLiquidity` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `PoolLiquidity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoolLiquidity" DROP COLUMN "apr",
DROP COLUMN "volume",
ADD COLUMN     "apr24h" TEXT DEFAULT '0',
ADD COLUMN     "apr7d" TEXT DEFAULT '0',
ADD COLUMN     "volume24h" TEXT DEFAULT '0',
ADD COLUMN     "volume7d" TEXT DEFAULT '0';
