ALTER TABLE "Church" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Church" ADD COLUMN "email" TEXT;
ALTER TABLE "Church" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Church" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'FULL_ACCESS';

UPDATE "Church"
SET
  "name" = "churchName",
  "email" = "slug" || '@sermonbridge.local',
  "passwordHash" = 'local-seed-password-hash-placeholder',
  "plan" = 'FULL_ACCESS'
WHERE "name" = '' OR "email" IS NULL OR "passwordHash" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "Church_email_key" ON "Church"("email");
