/*
  Warnings:

  - The primary key for the `form` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `form` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `schoolclass` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `schoolclass` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `formId` on the `schoolclass` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `schoolclasshasstudent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `schoolclasshasstudent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `studentId` on the `schoolclasshasstudent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `schoolClassId` on the `schoolclasshasstudent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `skill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `student` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `studenttest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `studenttest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `studentId` on the `studenttest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `testId` on the `studenttest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `studenttesthasskill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `studenttesthasskill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `studentTestId` on the `studenttesthasskill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `skillId` on the `studenttesthasskill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `test` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `test` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `schoolClassId` on the `test` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `testhasskill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `testhasskill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `testId` on the `testhasskill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `skillId` on the `testhasskill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `schoolclass` DROP FOREIGN KEY `SchoolClass_formId_fkey`;

-- DropForeignKey
ALTER TABLE `schoolclasshasstudent` DROP FOREIGN KEY `SchoolClassHasStudent_schoolClassId_fkey`;

-- DropForeignKey
ALTER TABLE `schoolclasshasstudent` DROP FOREIGN KEY `SchoolClassHasStudent_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `studenttest` DROP FOREIGN KEY `StudentTest_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `studenttest` DROP FOREIGN KEY `StudentTest_testId_fkey`;

-- DropForeignKey
ALTER TABLE `studenttesthasskill` DROP FOREIGN KEY `StudentTestHasSkill_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `studenttesthasskill` DROP FOREIGN KEY `StudentTestHasSkill_studentTestId_fkey`;

-- DropForeignKey
ALTER TABLE `test` DROP FOREIGN KEY `Test_schoolClassId_fkey`;

-- DropForeignKey
ALTER TABLE `testhasskill` DROP FOREIGN KEY `TestHasSkill_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `testhasskill` DROP FOREIGN KEY `TestHasSkill_testId_fkey`;

-- AlterTable
ALTER TABLE `form` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `schoolclass` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `formId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `schoolclasshasstudent` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `studentId` INTEGER NOT NULL,
    MODIFY `schoolClassId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `skill` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `student` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `studenttest` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `studentId` INTEGER NOT NULL,
    MODIFY `testId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `studenttesthasskill` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `studentTestId` INTEGER NOT NULL,
    MODIFY `skillId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `test` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `schoolClassId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `testhasskill` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `testId` INTEGER NOT NULL,
    MODIFY `skillId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `schoolclass` ADD CONSTRAINT `SchoolClass_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `form`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schoolclasshasstudent` ADD CONSTRAINT `SchoolClassHasStudent_schoolClassId_fkey` FOREIGN KEY (`schoolClassId`) REFERENCES `schoolclass`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schoolclasshasstudent` ADD CONSTRAINT `SchoolClassHasStudent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studenttest` ADD CONSTRAINT `StudentTest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studenttest` ADD CONSTRAINT `StudentTest_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studenttesthasskill` ADD CONSTRAINT `StudentTestHasSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studenttesthasskill` ADD CONSTRAINT `StudentTestHasSkill_studentTestId_fkey` FOREIGN KEY (`studentTestId`) REFERENCES `studenttest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test` ADD CONSTRAINT `Test_schoolClassId_fkey` FOREIGN KEY (`schoolClassId`) REFERENCES `schoolclass`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testhasskill` ADD CONSTRAINT `TestHasSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testhasskill` ADD CONSTRAINT `TestHasSkill_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
