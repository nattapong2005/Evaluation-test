-- CreateTable
CREATE TABLE `evaluation_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` ENUM('active', 'closed') NOT NULL DEFAULT 'active',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_topics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indicators` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NULL,
    `title` TEXT NOT NULL,
    `type` ENUM('score 1-4', 'yes no') NOT NULL,
    `weight` DOUBLE NULL DEFAULT 1.0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluator_id` INTEGER NULL,
    `evaluatee_id` INTEGER NULL,
    `period_id` INTEGER NULL,
    `status` ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',

    UNIQUE INDEX `unique_assignment`(`evaluator_id`, `evaluatee_id`, `period_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignment_id` INTEGER NULL,
    `indicator_id` INTEGER NULL,
    `score_value` INTEGER NULL,
    `note` TEXT NULL,
    `status` ENUM('draft', 'submitted', 'locked') NOT NULL DEFAULT 'draft',
    `submitted_at` DATETIME NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `indicators` ADD CONSTRAINT `indicators_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `evaluation_topics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_evaluator_id_fkey` FOREIGN KEY (`evaluator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_evaluatee_id_fkey` FOREIGN KEY (`evaluatee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_results` ADD CONSTRAINT `evaluation_results_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_results` ADD CONSTRAINT `evaluation_results_indicator_id_fkey` FOREIGN KEY (`indicator_id`) REFERENCES `indicators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `evaluation_results`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
