-- AlterTable
ALTER TABLE "Permission" RENAME COLUMN "content" TO "description";
ALTER TABLE "Permission" ALTER COLUMN "description" SET DEFAULT '';
