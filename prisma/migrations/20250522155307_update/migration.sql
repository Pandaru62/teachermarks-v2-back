/*
  Warnings:

  - You are about to drop the `_schoolclasstostudent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_schoolclasstostudent` DROP FOREIGN KEY `_schoolclassTostudent_A_fkey`;

-- DropForeignKey
ALTER TABLE `_schoolclasstostudent` DROP FOREIGN KEY `_schoolclassTostudent_B_fkey`;

-- DropTable
DROP TABLE `_schoolclasstostudent`;

-- CreateTable
CREATE TABLE `StudentHasSchoolClass` (
    `studentId` INTEGER NOT NULL,
    `schoolClassId` INTEGER NOT NULL,

    PRIMARY KEY (`studentId`, `schoolClassId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentHasSchoolClass` ADD CONSTRAINT `StudentHasSchoolClass_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentHasSchoolClass` ADD CONSTRAINT `StudentHasSchoolClass_schoolClassId_fkey` FOREIGN KEY (`schoolClassId`) REFERENCES `schoolclass`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
