/*
  Warnings:

  - The primary key for the `studenttesthasskill` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `studenttesthasskill` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`studentTestId`, `skillId`);
