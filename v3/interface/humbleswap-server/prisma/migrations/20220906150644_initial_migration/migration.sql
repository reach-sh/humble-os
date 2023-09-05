-- CreateEnum
CREATE TYPE "Blockchain" AS ENUM ('ALGO', 'ETH', 'SOL');

-- CreateEnum
CREATE TYPE "BlockchainProvider" AS ENUM ('mainnet', 'testnet');

-- CreateEnum
CREATE TYPE "PeraVerificationTier" AS ENUM ('suspicious', 'unverified', 'verified', 'trusted');

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(16) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "supply" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "verified" BOOLEAN,
    "verificationTier" "PeraVerificationTier" DEFAULT 'unverified',
    "chain" "Blockchain" NOT NULL,
    "provider" "BlockchainProvider" NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "announcerId" TEXT NOT NULL,
    "poolTokenId" TEXT NOT NULL,
    "tokenAId" TEXT NOT NULL,
    "tokenADecimals" INTEGER NOT NULL,
    "tokenBId" TEXT NOT NULL,
    "tokenBDecimals" INTEGER NOT NULL,
    "chain" "Blockchain" NOT NULL DEFAULT 'ALGO',
    "provider" "BlockchainProvider" NOT NULL DEFAULT 'testnet',

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolLiquidity" (
    "id" SERIAL NOT NULL,
    "tokenABalance" TEXT NOT NULL,
    "tokenAFees" TEXT NOT NULL,
    "tokenBBalance" TEXT NOT NULL,
    "tokenBFees" TEXT NOT NULL,
    "mintedLiquidityTokens" TEXT NOT NULL,
    "apr" INTEGER NOT NULL,
    "volume" INTEGER NOT NULL,
    "added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poolId" TEXT NOT NULL,

    CONSTRAINT "PoolLiquidity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "announcerId" TEXT NOT NULL,
    "stakedTokenPoolId" TEXT,
    "stakedTokenId" TEXT NOT NULL,
    "rewardTokenId" TEXT NOT NULL,
    "totalRewardA" TEXT NOT NULL,
    "totalRewardB" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "startBlock" TEXT NOT NULL,
    "endDate" TIMESTAMP(3),
    "endBlock" TEXT NOT NULL,
    "isPartnerFarm" BOOLEAN DEFAULT false,
    "networkRewardsPerBlock" TEXT NOT NULL,
    "rewardTokenRewardsPerBlock" TEXT NOT NULL,
    "rewardTokenDecimals" INTEGER NOT NULL,
    "rewardTokenSymbol" TEXT NOT NULL,
    "stakedTokenDecimals" INTEGER NOT NULL,
    "stakedTokenSymbol" TEXT NOT NULL,
    "stakedTokenTotalSupply" TEXT NOT NULL,
    "chain" "Blockchain" NOT NULL,
    "provider" "BlockchainProvider" NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmLiquidity" (
    "id" SERIAL NOT NULL,
    "remainingRewardA" TEXT NOT NULL,
    "remainingRewardB" TEXT NOT NULL,
    "totalStaked" TEXT NOT NULL,
    "primaryStakeTokenBalance" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmLiquidity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_id_key" ON "Token"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Pool_id_key" ON "Pool"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Farm_id_key" ON "Farm"("id");

-- AddForeignKey
ALTER TABLE "PoolLiquidity" ADD CONSTRAINT "PoolLiquidity_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmLiquidity" ADD CONSTRAINT "FarmLiquidity_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
