/*
  Warnings:

  - You are about to drop the `_skilltotest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `test` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_skilltotest` DROP FOREIGN KEY `_skillTotest_A_fkey`;

-- DropForeignKey
ALTER TABLE `_skilltotest` DROP FOREIGN KEY `_skillTotest_B_fkey`;

-- AlterTable
ALTER TABLE `test` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_skilltotest`;

-- CreateTable
CREATE TABLE `testhasskill` (
    `testId` INTEGER NOT NULL,
    `skillId` INTEGER NOT NULL,

    PRIMARY KEY (`testId`, `skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `testhasskill` ADD CONSTRAINT `testhasskill_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `test`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testhasskill` ADD CONSTRAINT `testhasskill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
