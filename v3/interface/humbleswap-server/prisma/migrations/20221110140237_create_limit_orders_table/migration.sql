-- CreateEnum
CREATE TYPE "LimitOrderStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "LimitOrder" (
    "contractId" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "amtA" TEXT NOT NULL,
    "amtB" TEXT NOT NULL,
    "tokenA" TEXT NOT NULL,
    "tokenB" TEXT NOT NULL,
    "tokenADecimals" INTEGER NOT NULL,
    "tokenBDecimals" INTEGER NOT NULL,
    "status" "LimitOrderStatus" NOT NULL DEFAULT 'open',
    "announcerId" TEXT NOT NULL,
    "chain" "Blockchain" NOT NULL,
    "provider" "BlockchainProvider" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LimitOrder_contractId_key" ON "LimitOrder"("contractId");
