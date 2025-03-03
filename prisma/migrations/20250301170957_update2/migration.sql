/*
  Warnings:

  - The primary key for the `studenttest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `studenttest` table. All the data in the column will be lost.
  - The primary key for the `studenttesthasskill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `studenttesthasskill` table. All the data in the column will be lost.
  - You are about to drop the column `isMarked` on the `studenttesthasskill` table. All the data in the column will be lost.
  - You are about to alter the column `level` on the `studenttesthasskill` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Enum(EnumId(1))`.

*/
-- DropForeignKey
ALTER TABLE `studenttesthasskill` DROP FOREIGN KEY `studenttesthasskill_studentTestId_fkey`;

-- AlterTable
ALTER TABLE `studenttest` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`studentId`, `testId`);

-- AlterTable
ALTER TABLE `studenttesthasskill` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `isMarked`,
    MODIFY `level` ENUM('LVL0', 'LVL1', 'LVL2', 'LVL3', 'LVL4', 'ABS', 'NN') NOT NULL,
    ADD PRIMARY KEY (`skillId`, `studentTestId`);

-- AddForeignKey
ALTER TABLE `studenttesthasskill` ADD CONSTRAINT `studenttesthasskill_studentTestId_skillId_fkey` FOREIGN KEY (`studentTestId`, `skillId`) REFERENCES `studenttest`(`studentId`, `testId`) ON DELETE CASCADE ON UPDATE CASCADE;
