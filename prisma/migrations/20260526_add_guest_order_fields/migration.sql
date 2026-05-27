-- Make userId optional on Order (to support guest checkout)
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- Add guest contact fields
ALTER TABLE "Order" ADD COLUMN "guestName"  TEXT;
ALTER TABLE "Order" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN "guestPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN "pickupNote" TEXT;

-- Index on guestEmail for admin lookups
CREATE INDEX "Order_guestEmail_idx" ON "Order"("guestEmail");
