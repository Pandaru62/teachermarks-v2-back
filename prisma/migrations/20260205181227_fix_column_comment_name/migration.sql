/*
  Warnings:

  - You are about to drop the column `commment` on the `studenttest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `studenttest` DROP COLUMN `commment`,
    ADD COLUMN `comment` VARCHAR(191) NULL DEFAULT '';
