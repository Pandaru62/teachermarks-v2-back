/*
  Warnings:

  - Added the required column `createdById` to the `testTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `testtag` ADD COLUMN `createdById` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `testTag` ADD CONSTRAINT `testTag_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
