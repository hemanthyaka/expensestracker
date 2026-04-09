-- Truncate dependent tables first (expenses and budgets reference categories)
TRUNCATE "Budget" RESTART IDENTITY CASCADE;
TRUNCATE "Expense" RESTART IDENTITY CASCADE;
TRUNCATE "Category" RESTART IDENTITY CASCADE;

-- Drop old unique constraint on name alone
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key";

-- Add userId column
ALTER TABLE "Category" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Category" ALTER COLUMN "userId" DROP DEFAULT;

-- Add foreign key
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint per user+name
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");
