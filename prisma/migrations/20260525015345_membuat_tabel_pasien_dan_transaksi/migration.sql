-- CreateTable
CREATE TABLE `Pasien` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `tanggalLahir` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pasienId` INTEGER NOT NULL,
    `terapi` VARCHAR(191) NOT NULL,
    `pembayaran` VARCHAR(191) NOT NULL,
    `totalHarga` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_pasienId_fkey` FOREIGN KEY (`pasienId`) REFERENCES `Pasien`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
