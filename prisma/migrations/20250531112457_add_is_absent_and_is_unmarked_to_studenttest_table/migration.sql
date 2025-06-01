-- AlterTable
ALTER TABLE `studenttest` ADD COLUMN `isAbsent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isUnmarked` BOOLEAN NOT NULL DEFAULT false;
