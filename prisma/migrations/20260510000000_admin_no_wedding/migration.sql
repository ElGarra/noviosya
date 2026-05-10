-- Make weddingId optional on WeddingAdmin (admin is platform-level, not tied to a wedding)

-- Drop old FK with CASCADE
ALTER TABLE "WeddingAdmin" DROP CONSTRAINT "WeddingAdmin_weddingId_fkey";

-- Make weddingId nullable
ALTER TABLE "WeddingAdmin" ALTER COLUMN "weddingId" DROP NOT NULL;

-- Drop compound unique (weddingId, email) → replace with unique(email)
DROP INDEX "WeddingAdmin_weddingId_email_key";
CREATE UNIQUE INDEX "WeddingAdmin_email_key" ON "WeddingAdmin"("email");

-- Re-add FK with SET NULL
ALTER TABLE "WeddingAdmin" ADD CONSTRAINT "WeddingAdmin_weddingId_fkey"
  FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;
