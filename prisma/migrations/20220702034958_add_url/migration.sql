/*
  Warnings:

  - Added the required column `remoteUrl` to the `Calendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "remoteUrl" TEXT NOT NULL;
