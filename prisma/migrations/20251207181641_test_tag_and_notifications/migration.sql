-- AlterTable
ALTER TABLE `test` ADD COLUMN `testTagId` INTEGER NULL;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `notifications_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userHasNotifications` (
    `userId` INTEGER NOT NULL,
    `notificationId` INTEGER NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    INDEX `userHasNotifications_notificationId_idx`(`notificationId`),
    PRIMARY KEY (`userId`, `notificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `testTag_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userHasNotifications` ADD CONSTRAINT `userHasNotifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userHasNotifications` ADD CONSTRAINT `userHasNotifications_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `notifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test` ADD CONSTRAINT `test_testTagId_fkey` FOREIGN KEY (`testTagId`) REFERENCES `testTag`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
