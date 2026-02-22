-- AlterTable
ALTER TABLE `evaluation` ADD COLUMN `status` ENUM('ACTIVE', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE `ScoreHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scoreId` INTEGER NOT NULL,
    `updaterId` INTEGER NOT NULL,
    `oldScore` DOUBLE NULL,
    `newScore` DOUBLE NULL,
    `oldRemarks` VARCHAR(191) NULL,
    `newRemarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScoreHistory` ADD CONSTRAINT `ScoreHistory_scoreId_fkey` FOREIGN KEY (`scoreId`) REFERENCES `Score`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreHistory` ADD CONSTRAINT `ScoreHistory_updaterId_fkey` FOREIGN KEY (`updaterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
