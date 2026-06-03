-- AlterTable
ALTER TABLE `detail_transaksi` ADD COLUMN `namaManual` VARCHAR(200) NULL,
    MODIFY `terapiId` INTEGER NULL,
    MODIFY `hargaPokok` INTEGER NOT NULL DEFAULT 0;
