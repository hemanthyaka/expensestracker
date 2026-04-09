-- Add partial unique index for default categories (userId IS NULL)
-- PostgreSQL does not treat NULL=NULL in unique indexes, so we need this
-- to prevent duplicate default category names
CREATE UNIQUE INDEX IF NOT EXISTS "Category_null_userId_name_key"
  ON "Category"("name")
  WHERE "userId" IS NULL;
