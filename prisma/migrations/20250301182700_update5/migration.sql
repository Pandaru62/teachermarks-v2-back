/*
  Warnings:

  - The primary key for the `studenttest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[studentId,testId]` on the table `studenttest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `studenttest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `studenttesthasskill` DROP FOREIGN KEY `studenttesthasskill_studentTestId_skillId_fkey`;

-- AlterTable
ALTER TABLE `studenttest` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `studenttest_studentId_testId_key` ON `studenttest`(`studentId`, `testId`);

-- AddForeignKey
ALTER TABLE `studenttesthasskill` ADD CONSTRAINT `studenttesthasskill_studentTestId_fkey` FOREIGN KEY (`studentTestId`) REFERENCES `studenttest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
