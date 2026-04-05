-- DropIndex
DROP INDEX `Holiday_holidayDate_key` ON `holiday`;

-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `policyId` INTEGER NULL,
    ADD COLUMN `source` ENUM('WEB', 'MANUAL_CORRECTION', 'REGULARIZATION', 'IMPORT') NOT NULL DEFAULT 'WEB';

-- AlterTable
ALTER TABLE `holiday` ADD COLUMN `isOptional` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workLocationId` INTEGER NULL;

-- CreateTable
CREATE TABLE `WeeklyOffRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `workLocationId` INTEGER NULL,
    `weekDay` INTEGER NOT NULL,
    `weekNumberInMonth` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `effectiveFrom` DATETIME(3) NOT NULL,
    `effectiveTo` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WeeklyOffRule_workLocationId_isActive_idx`(`workLocationId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceAuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attendanceId` INTEGER NOT NULL,
    `changedByUserId` INTEGER NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `fieldName` VARCHAR(191) NOT NULL,
    `oldValue` VARCHAR(191) NULL,
    `newValue` VARCHAR(191) NULL,
    `changeReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AttendanceAuditLog_attendanceId_createdAt_idx`(`attendanceId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Attendance_policyId_idx` ON `Attendance`(`policyId`);

-- CreateIndex
CREATE UNIQUE INDEX `Holiday_holidayDate_workLocationId_key` ON `Holiday`(`holidayDate`, `workLocationId`);

-- AddForeignKey
ALTER TABLE `WeeklyOffRule` ADD CONSTRAINT `WeeklyOffRule_workLocationId_fkey` FOREIGN KEY (`workLocationId`) REFERENCES `WorkLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Holiday` ADD CONSTRAINT `Holiday_workLocationId_fkey` FOREIGN KEY (`workLocationId`) REFERENCES `WorkLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `AttendancePolicy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceAuditLog` ADD CONSTRAINT `AttendanceAuditLog_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `Attendance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceAuditLog` ADD CONSTRAINT `AttendanceAuditLog_changedByUserId_fkey` FOREIGN KEY (`changedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
