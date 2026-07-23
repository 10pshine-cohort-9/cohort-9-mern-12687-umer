-- DropForeignKey
ALTER TABLE `blocks` DROP FOREIGN KEY `blocks_document_id_fkey`;

-- DropIndex
DROP INDEX `blocks_document_id_fkey` ON `blocks`;

-- AddForeignKey
ALTER TABLE `blocks` ADD CONSTRAINT `blocks_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
