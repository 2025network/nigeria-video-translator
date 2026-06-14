CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'ADMIN',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Church" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "churchName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "youtubeLiveUrl" TEXT NOT NULL,
  "defaultSpokenLanguage" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");

CREATE TABLE "ChurchLanguage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "language" TEXT NOT NULL,
  "churchId" TEXT NOT NULL,
  CONSTRAINT "ChurchLanguage_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ChurchLanguage_churchId_language_key" ON "ChurchLanguage"("churchId", "language");

CREATE TABLE "ChurchCountry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "country" TEXT NOT NULL,
  "churchId" TEXT NOT NULL,
  CONSTRAINT "ChurchCountry_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ChurchCountry_churchId_country_key" ON "ChurchCountry"("churchId", "country");
