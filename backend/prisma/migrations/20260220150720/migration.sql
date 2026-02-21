/*
  Warnings:

  - You are about to alter the column `submitted_at` on the `evaluation_results` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `evaluation_results` MODIFY `submitted_at` DATETIME NULL;
