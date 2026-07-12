-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "specialization" TEXT,
    "experienceYears" INTEGER NOT NULL,
    "educationLevel" TEXT NOT NULL DEFAULT 'NESSUNO',
    "educationField" TEXT,
    "skills" TEXT NOT NULL,
    "certifications" TEXT,
    "hasLicense" BOOLEAN NOT NULL DEFAULT false,
    "hasCar" BOOLEAN NOT NULL DEFAULT false,
    "availabilityStatus" TEXT NOT NULL,
    "maxDistanceKm" INTEGER NOT NULL DEFAULT 50,
    "desiredContract" TEXT NOT NULL,
    "desiredSalary" TEXT,
    "cvPdfUrl" TEXT,
    "videoPresentationUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkerProfile" ("availabilityStatus", "certifications", "city", "createdAt", "cvPdfUrl", "desiredContract", "desiredSalary", "experienceYears", "firstName", "hasCar", "hasLicense", "id", "lastName", "maxDistanceKm", "photoUrl", "profession", "province", "region", "skills", "specialization", "updatedAt", "userId", "videoPresentationUrl") SELECT "availabilityStatus", "certifications", "city", "createdAt", "cvPdfUrl", "desiredContract", "desiredSalary", "experienceYears", "firstName", "hasCar", "hasLicense", "id", "lastName", "maxDistanceKm", "photoUrl", "profession", "province", "region", "skills", "specialization", "updatedAt", "userId", "videoPresentationUrl" FROM "WorkerProfile";
DROP TABLE "WorkerProfile";
ALTER TABLE "new_WorkerProfile" RENAME TO "WorkerProfile";
CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "WorkerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
