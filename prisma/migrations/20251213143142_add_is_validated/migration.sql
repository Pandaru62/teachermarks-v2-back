-- CreateTable
CREATE TABLE `studenttesthasweaknesses` (
    `studentTestId` INTEGER NOT NULL,
    `weaknessId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    INDEX `studenttesthasweaknesses_weaknessId_idx`(`weaknessId`),
    INDEX `studenttesthasweaknesses_studentTestId_idx`(`studentTestId`),
    PRIMARY KEY (`studentTestId`, `weaknessId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weakness` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `userId` INTEGER NULL,

    INDEX `weakness_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `studenttesthasweaknesses` ADD CONSTRAINT `studenttesthasweaknesses_weaknessId_fkey` FOREIGN KEY (`weaknessId`) REFERENCES `weakness`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studenttesthasweaknesses` ADD CONSTRAINT `studenttesthasweaknesses_studentTestId_fkey` FOREIGN KEY (`studentTestId`) REFERENCES `studenttest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weakness` ADD CONSTRAINT `weakness_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
