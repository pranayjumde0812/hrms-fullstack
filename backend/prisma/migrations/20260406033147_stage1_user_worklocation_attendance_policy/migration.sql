-- AlterTable
ALTER TABLE `user` ADD COLUMN `confirmationDate` DATETIME(3) NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `employeeCode` VARCHAR(191) NULL,
    ADD COLUMN `employmentType` ENUM('FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACTOR', 'CONSULTANT') NOT NULL DEFAULT 'FULL_TIME',
    ADD COLUMN `exitDate` DATETIME(3) NULL,
    ADD COLUMN `lifecycleStatus` ENUM('ACTIVE', 'PROBATION', 'NOTICE', 'EXITED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `timeZone` VARCHAR(191) NULL,
    ADD COLUMN `workLocationId` INTEGER NULL;

-- CreateTable
CREATE TABLE `WorkLocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `timeZone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WorkLocation_name_key`(`name`),
    UNIQUE INDEX `WorkLocation_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendancePolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `workLocationId` INTEGER NULL,
    `standardWorkingHours` DOUBLE NOT NULL DEFAULT 8,
    `lateAfterMinutes` INTEGER NOT NULL,
    `halfDayAfterMinutes` INTEGER NOT NULL,
    `halfDayMinWorkingHours` DOUBLE NOT NULL,
    `graceMinutes` INTEGER NOT NULL DEFAULT 0,
    `overtimeAllowed` BOOLEAN NOT NULL DEFAULT true,
    `autoAbsentEnabled` BOOLEAN NOT NULL DEFAULT false,
    `effectiveFrom` DATETIME(3) NOT NULL,
    `effectiveTo` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AttendancePolicy_name_key`(`name`),
    INDEX `AttendancePolicy_workLocationId_isActive_idx`(`workLocationId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_employeeCode_key` ON `User`(`employeeCode`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workLocationId_fkey` FOREIGN KEY (`workLocationId`) REFERENCES `WorkLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendancePolicy` ADD CONSTRAINT `AttendancePolicy_workLocationId_fkey` FOREIGN KEY (`workLocationId`) REFERENCES `WorkLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
