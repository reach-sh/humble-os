/*
  Warnings:

  - The `status` column on the `LimitOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `verificationTier` column on the `Token` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LimitOrder" DROP COLUMN "status",
ADD COLUMN     "status" "LimitOrderStatus" NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "verificationTier",
ADD COLUMN     "verificationTier" "PeraVerificationTier" DEFAULT 'unverified';
