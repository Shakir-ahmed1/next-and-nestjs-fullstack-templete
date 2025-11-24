-- CreateTable
CREATE TABLE `upload_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUri` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `purpose` ENUM('avatar', 'product') NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `upload_images_fileUri_key`(`fileUri`),
    UNIQUE INDEX `upload_images_filePath_key`(`filePath`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
