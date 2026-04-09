-- Make userId nullable (default categories have no owner)
ALTER TABLE "Category" ALTER COLUMN "userId" DROP NOT NULL;

-- Drop old unique index and recreate (nullable userId needs special handling)
DROP INDEX IF EXISTS "Category_userId_name_key";
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");

-- Seed default categories with userId = NULL
INSERT INTO "Category" ("userId", "name", "color", "icon", "createdAt") VALUES
  (NULL, 'Food',          '#10b981', 'utensils',       NOW()),
  (NULL, 'Housing',       '#8b5cf6', 'home',           NOW()),
  (NULL, 'Transport',     '#22c55e', 'car',            NOW()),
  (NULL, 'Entertainment', '#ec4899', 'tv',             NOW()),
  (NULL, 'Health',        '#f59e0b', 'heart-pulse',    NOW()),
  (NULL, 'Shopping',      '#38bdf8', 'shopping-bag',   NOW())
ON CONFLICT DO NOTHING;
