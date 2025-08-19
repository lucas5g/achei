-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('RESOLUCAO', 'ATO');

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "public"."Type" NOT NULL,
    "urlPdf" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
