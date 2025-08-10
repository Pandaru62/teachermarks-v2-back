/*
  Warnings:

  - A unique constraint covering the columns `[studentId,trimester]` on the table `report` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `current_trimester` ENUM('TR1', 'TR2', 'TR3') NOT NULL DEFAULT 'TR1';

-- CreateIndex
CREATE UNIQUE INDEX `report_studentId_trimester_key` ON `report`(`studentId`, `trimester`);
