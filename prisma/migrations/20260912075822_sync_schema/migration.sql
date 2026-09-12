/*
  Warnings:

  - You are about to drop the column `userId` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `current_trimester` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `is_first_visit` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `is_validated` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `weakness` table. All the data in the column will be lost.
  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userHasSchoolclass` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[login]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolYear` to the `schoolclass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `profile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_userId_fkey`;

-- DropForeignKey
ALTER TABLE `testTag` DROP FOREIGN KEY `testTag_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `UserHasSchoolClass` DROP FOREIGN KEY `UserHasSchoolClass_schoolClassId_fkey`;

-- DropForeignKey
ALTER TABLE `UserHasSchoolClass` DROP FOREIGN KEY `UserHasSchoolClass_userId_fkey`;

-- DropForeignKey
ALTER TABLE `weakness` DROP FOREIGN KEY `weakness_userId_fkey`;

-- DropIndex
DROP INDEX `comment_createdById_fkey` ON `comment`;

-- DropIndex
DROP INDEX `skill_userId_idx` ON `skill`;

-- DropIndex
DROP INDEX `testTag_createdById_fkey` ON `testTag`;

-- DropIndex
DROP INDEX `user_email_key` ON `user`;

-- DropIndex
DROP INDEX `weakness_userId_idx` ON `weakness`;

-- AlterTable
ALTER TABLE `schoolclass` ADD COLUMN `schoolYear` ENUM('Y2025_2026', 'Y2026_2027') NOT NULL;

-- AlterTable
ALTER TABLE `skill` DROP COLUMN `userId`,
    ADD COLUMN `teacherId` INTEGER NULL;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `current_trimester`,
    DROP COLUMN `is_first_visit`,
    DROP COLUMN `is_validated`,
    ADD COLUMN `isFirstVisit` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isValidated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `login` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL;

-- AlterTable
ALTER TABLE `weakness` DROP COLUMN `userId`,
    ADD COLUMN `teacherId` INTEGER NULL;

-- DropTable
DROP TABLE `profile`;

-- DropTable
DROP TABLE `UserHasSchoolClass`;

-- CreateTable
CREATE TABLE `teacher` (
    `userId` INTEGER NOT NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `schoolId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `teacher_userId_key`(`userId`),
    INDEX `teacher_userId_idx`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `currentTrimester` ENUM('TR1', 'TR2', 'TR3') NOT NULL DEFAULT 'TR1',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherHasSchoolClass` (
    `teacherId` INTEGER NOT NULL,
    `schoolClassId` INTEGER NOT NULL,

    PRIMARY KEY (`teacherId`, `schoolClassId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `skill_teacherId_idx` ON `skill`(`teacherId`);

-- CreateIndex
CREATE UNIQUE INDEX `student_userId_key` ON `student`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_login_key` ON `user`(`login`);

-- CreateIndex
CREATE INDEX `weakness_teacherId_idx` ON `weakness`(`teacherId`);

-- AddForeignKey
ALTER TABLE `teacher` ADD CONSTRAINT `teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher` ADD CONSTRAINT `teacher_schoolId_fkey` FOREIGN KEY (`schoolId`) REFERENCES `school`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `teacher`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weakness` ADD CONSTRAINT `weakness_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testTag` ADD CONSTRAINT `testTag_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `teacher`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherHasSchoolClass` ADD CONSTRAINT `TeacherHasSchoolClass_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherHasSchoolClass` ADD CONSTRAINT `TeacherHasSchoolClass_schoolClassId_fkey` FOREIGN KEY (`schoolClassId`) REFERENCES `schoolclass`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
