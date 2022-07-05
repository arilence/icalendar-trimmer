-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "events" TEXT[],

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);
