-- Truncate orphaned data that has no user association
TRUNCATE "Budget" RESTART IDENTITY CASCADE;
TRUNCATE "MonthlyBudget" RESTART IDENTITY CASCADE;
TRUNCATE "Expense" RESTART IDENTITY CASCADE;

-- AlterTable Expense: add userId
ALTER TABLE "Expense" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Expense" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Budget: drop old unique, add userId, add new unique
ALTER TABLE "Budget" DROP CONSTRAINT IF EXISTS "Budget_categoryId_month_key";
ALTER TABLE "Budget" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Budget" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Budget_userId_categoryId_month_key" ON "Budget"("userId", "categoryId", "month");

-- Recreate MonthlyBudget with userId (drop old PK, add id + userId)
ALTER TABLE "MonthlyBudget" DROP CONSTRAINT IF EXISTS "MonthlyBudget_pkey";
ALTER TABLE "MonthlyBudget" ADD COLUMN "id" SERIAL;
ALTER TABLE "MonthlyBudget" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MonthlyBudget" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "MonthlyBudget" ADD CONSTRAINT "MonthlyBudget_pkey" PRIMARY KEY ("id");
ALTER TABLE "MonthlyBudget" ADD CONSTRAINT "MonthlyBudget_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "MonthlyBudget_userId_month_key" ON "MonthlyBudget"("userId", "month");
