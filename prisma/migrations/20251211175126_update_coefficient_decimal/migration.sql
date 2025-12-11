/*
  Warnings:

  - You are about to alter the column `coefficient` on the `test` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE `test` MODIFY `coefficient` DECIMAL(5, 2) NOT NULL;
