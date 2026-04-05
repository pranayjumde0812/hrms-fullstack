# HRMS Database Blueprint

This document defines the recommended database structure for the HRMS based on the current roadmap and the features already implemented.

It should be treated as the database source of truth before applying future Prisma schema changes.

## Migration Rule

All database changes must go through **Prisma migration files**.

We should not use `prisma db push` as the normal workflow for this project.

Required rule going forward:

1. Update `schema.prisma`
2. Create a migration with `prisma migrate dev --name <change_name>`
3. Commit the generated migration files
4. Apply migrations in other environments using `prisma migrate deploy`
5. Regenerate Prisma Client after schema changes

Reason:
- keeps schema history
- makes team collaboration safer
- makes production rollout predictable
- avoids silent database drift

Status guide:
- `[x]` Already aligned in current schema
- `[~]` Partially aligned, needs extension
- `[ ]` Not yet modeled

## Recommendation

Do **not** rewrite the full database in one shot right now.

Recommended approach:

1. Keep the current schema as the working base
2. Add missing Phase 1 foundations in controlled migrations
3. Refactor weak tables before payroll becomes dependent on them
4. Introduce Phase 2 and Phase 3 tables only when their workflows are ready

Reason:
- Attendance, users, holidays, regularization, and current manager logic are already live in code
- A full schema rewrite now would force large backend and frontend changes together
- The biggest current issue is not that the DB is unusable, but that some modules are too simple for the roadmap

## Current Schema Alignment Summary

### Well aligned with current roadmap
- `[x]` `User`
- `[x]` `Department`
- `[x]` `WorkLocation`
- `[x]` `AttendancePolicy`
- `[x]` `WeeklyOffRule`
- `[x]` `Holiday`
- `[x]` `Attendance`
- `[x]` `AttendanceRegularization`
- `[x]` `LoginActivity`
- `[x]` `Project`
- `[x]` `UserProjectAssignment` should be explicit
- `[x]` `Timesheet`

### Partially aligned and should be upgraded
- `[~]` `Leave`
- `[~]` `Payroll`
- `[~]` `Attendance` for auditability completion and payroll-readiness

### Not yet modeled but needed by roadmap
- `[ ]` Leave type master
- `[ ]` Leave policy master
- `[ ]` Leave balance ledger
- `[~]` Attendance audit log
- `[ ]` Payroll run / payroll item breakdown

## My Call

The database is **not fully aligned yet**, but it is good enough as a base.

So the correct move is:

1. **Do not replace everything now**
2. **Design the target database properly**
3. **Upgrade the current schema phase by phase**

That is the safest and most industry-correct path for this codebase.

## Current Database Review

### 1. User

Current status: `[x]`

Current model is a good start because it already supports:
- login identity
- roles
- department
- manager mapping
- salary placeholders

The important employee master fields are now present:
- employee code
- lifecycle status
- employment type
- work location
- timezone
- designation
- exit date

Recommended target:
- keep `User` as the employee master
- extend it instead of creating a separate employee table

### 2. Department

Current status: `[x]`

Current model is acceptable for now.

Recommended extension later:
- department head user reference
- department code

### 3. Holiday

Current status: `[x]`

Current model now supports:
- company-wide holidays
- optional work-location applicability
- optional holiday flag

It should later support:
- holiday type
- optional restricted holiday flag

### 4. Attendance

Current status: `[~]`

Current model is strong for a first version:
- check-in / check-out
- work mode
- late mark
- half day
- overtime
- manual correction metadata

But for the roadmap it still needs:
- link to attendance policy used
- stronger final status semantics for payroll
- audit history for changes is only partially implemented in code today
- shift / weekly-off awareness later

### 5. Attendance Regularization

Current status: `[x]`

This is well aligned with the current workflow.

Future improvements:
- approval level
- escalation status
- attachment support if company policy needs proof

### 6. Leave

Current status: `[~]`

This is the weakest major table in the current schema.

Problems:
- `type` is a plain string
- `status` is a plain string
- no approver reference
- no cancellation tracking
- no partial-day support
- no leave policy relation
- no balance ledger relation

Recommendation:
- keep current leave requests concept
- evolve it into a proper request table
- move policy and balances into separate master tables

### 7. Payroll

Current status: `[~]`

Current payroll table is too simplified for future roadmap needs.

Problems:
- no uniqueness for user + month + year
- no payroll status / lock state
- no salary component breakdown
- no attendance linkage
- no leave deduction linkage
- no overtime payout linkage

Recommendation:
- keep this as the initial payroll result table
- later split into payroll run + payroll record + payroll line items

### 8. Project and Timesheet

Current status: `[x]`

These are acceptable for current project/timesheet workflows.

For project membership, prefer an explicit join table over Prisma's implicit `_UserProjects` table.

Recommended approach:
- use `UserProjectAssignment`
- keep readable keys like `userId` and `projectId`
- allow future metadata like `assignedAt`, `assignedById`, `roleInProject`, `isActive`

They are not blockers for the Phase 1 HR foundation work.

## Target Database Structure

This is the recommended target structure to build toward.

## Core Master Tables

### `User`
- `id`
- `employeeCode`
- `email`
- `password`
- `firstName`
- `lastName`
- `role`
- `designation`
- `departmentId`
- `managerId`
- `employmentType`
- `lifecycleStatus`
- `workLocationId`
- `timeZone`
- `joiningDate`
- `confirmationDate`
- `exitDate`
- `baseSalary`
- `hourlyRate`
- `createdAt`
- `updatedAt`

### `Department`
- `id`
- `code`
- `name`
- `description`
- `headUserId`
- `createdAt`
- `updatedAt`

### `WorkLocation`
- `id`
- `name`
- `code`
- `timeZone`
- `address`
- `isActive`
- `createdAt`
- `updatedAt`

### `UserProjectAssignment`
- `id`
- `userId`
- `projectId`
- `assignedAt`
- `assignedById` nullable
- `roleInProject` nullable
- `isActive`
- `createdAt`
- `updatedAt`

### `Holiday`
- `id`
- `name`
- `holidayDate`
- `type`
- `workLocationId` nullable
- `isOptional`
- `description`
- `createdAt`
- `updatedAt`

### `AttendancePolicy`
- `id`
- `name`
- `workLocationId` nullable
- `standardWorkingHours`
- `lateAfterMinutes`
- `halfDayAfterMinutes`
- `halfDayMinWorkingHours`
- `graceMinutes`
- `overtimeAllowed`
- `autoAbsentEnabled`
- `effectiveFrom`
- `effectiveTo` nullable
- `isActive`
- `createdAt`
- `updatedAt`

### `WeeklyOffRule`
- `id`
- `name`
- `workLocationId` nullable
- `weekDay`
- `weekNumberInMonth` nullable
- `isActive`
- `effectiveFrom`
- `effectiveTo` nullable
- `createdAt`
- `updatedAt`

## Attendance Tables

### `Attendance`
- `id`
- `userId`
- `attendanceDate`
- `workMode`
- `source`
- `policyId` nullable
- `dayStatus`
- `finalStatus`
- `lateMark`
- `workingHours`
- `overtimeMinutes`
- `overtimeStatus`
- `overtimeReviewerId` nullable
- `overtimeReviewNotes` nullable
- `overtimeReviewedAt` nullable
- `manualCorrectionReason` nullable
- `manualCorrectedById` nullable
- `manualCorrectedAt` nullable
- `checkInAt`
- `checkOutAt` nullable
- `checkInLatitude` nullable
- `checkInLongitude` nullable
- `checkOutLatitude` nullable
- `checkOutLongitude` nullable
- `checkInIpAddress` nullable
- `checkOutIpAddress` nullable
- `checkInUserAgent` nullable
- `checkOutUserAgent` nullable
- `createdAt`
- `updatedAt`

### `AttendanceRegularization`
- `id`
- `userId`
- `attendanceDate`
- `type`
- `status`
- `reason`
- `requestedCheckInAt` nullable
- `requestedCheckOutAt` nullable
- `requestedWorkMode` nullable
- `reviewerId` nullable
- `reviewNotes` nullable
- `reviewedAt` nullable
- `createdAt`
- `updatedAt`

### `AttendanceAuditLog`
- `id`
- `attendanceId`
- `changedByUserId` nullable
- `changeType`
- `fieldName`
- `oldValue` nullable
- `newValue` nullable
- `changeReason` nullable
- `createdAt`

## Leave Tables

### `LeaveType`
- `id`
- `code`
- `name`
- `isPaid`
- `allowHalfDay`
- `allowBackdated`
- `requiresDocument`
- `isActive`
- `createdAt`
- `updatedAt`

### `LeavePolicy`
- `id`
- `name`
- `leaveTypeId`
- `workLocationId` nullable
- `employmentType` nullable
- `lifecycleStatus` nullable
- `annualQuota`
- `accrualMode`
- `carryForwardLimit` nullable
- `expiryMonths` nullable
- `sandwichPolicyEnabled`
- `encashmentAllowed`
- `isActive`
- `effectiveFrom`
- `effectiveTo` nullable
- `createdAt`
- `updatedAt`

### `LeaveBalance`
- `id`
- `userId`
- `leaveTypeId`
- `year`
- `openingBalance`
- `credited`
- `used`
- `adjusted`
- `closingBalance`
- `updatedAt`

### `LeaveBalanceLedger`
- `id`
- `userId`
- `leaveTypeId`
- `leaveRequestId` nullable
- `entryType`
- `quantity`
- `balanceAfter`
- `remarks` nullable
- `createdByUserId` nullable
- `createdAt`

### `LeaveRequest`
- `id`
- `userId`
- `leaveTypeId`
- `policyId` nullable
- `startDate`
- `endDate`
- `startSession`
- `endSession`
- `quantity`
- `status`
- `approverId` nullable
- `reviewNotes` nullable
- `reviewedAt` nullable
- `cancelledAt` nullable
- `cancelReason` nullable
- `reason` nullable
- `createdAt`
- `updatedAt`

## Payroll Tables

### `PayrollRun`
- `id`
- `month`
- `year`
- `status`
- `processedAt` nullable
- `lockedAt` nullable
- `processedByUserId` nullable
- `createdAt`
- `updatedAt`

### `PayrollRecord`
- `id`
- `payrollRunId`
- `userId`
- `paidDays`
- `lossOfPayDays`
- `baseAmount`
- `overtimeAmount`
- `allowanceAmount`
- `deductionAmount`
- `netPay`
- `paymentDate` nullable
- `createdAt`
- `updatedAt`

### `PayrollLineItem`
- `id`
- `payrollRecordId`
- `componentType`
- `componentCode`
- `componentName`
- `amount`
- `createdAt`

## Existing Prisma Schema Upgrade Plan

This is the safest path to update the real schema.

### Stage 1: Safe extensions to current base
- `[x]` add employee master fields to `User`
- `[x]` replace implicit project join with explicit `UserProjectAssignment`
- `[x]` add `WorkLocation`
- `[x]` add `AttendancePolicy`
- `[x]` add `WeeklyOffRule`
- `[x]` extend `Holiday` with optional location applicability
- `[x]` add attendance source enum and audit log table
- `[~]` wire attendance audit log writes into all change flows

### Stage 2: Refactor leave properly
- replace plain leave strings with enums or master references
- evolve `Leave` into `LeaveRequest`
- add `LeaveType`
- add `LeavePolicy`
- add `LeaveBalance`
- add `LeaveBalanceLedger`

### Stage 3: Refactor payroll for roadmap
- add uniqueness and status handling
- introduce payroll run concept
- add payroll line items
- link payroll calculation to attendance and leave outputs

## Immediate Prisma Change Priority

If we start schema work now, do it in this order:

1. Add missing employee master fields to `User`
2. Add `WorkLocation`
3. Add `AttendancePolicy`
4. Add `WeeklyOffRule`
5. Extend `Holiday`
6. Extend `Attendance` with source and policy relation
7. Add `AttendanceAuditLog`
8. Refactor leave models
9. Refactor payroll models

## Important Migration Rule

Before changing Prisma models:

1. Check all repositories and services using that model
2. Update validators and route payloads
3. Update frontend forms and tables
4. Add migration-safe defaults for existing rows
5. Avoid destructive renames unless data migration is ready

## Final Call

The current DB is a **usable starting point**, but not the final structure we should grow on without changes.

Best approach:
- use the current DB as the live base
- use this document as the target design
- implement schema changes in controlled phases

This is better than rebuilding the full DB immediately.

## Stability Checkpoint

Current phase status:
- Attendance master schema changes are applied through Prisma migrations
- Frontend admin screens exist for work locations, attendance policies, weekly-off rules, employee master fields, and holiday master updates
- Backend and frontend were smoke-tested together on a running local server
- One runtime mismatch in weekly-off rule creation was fixed during smoke testing

This means the attendance-master phase is stable enough to treat as the baseline before starting the leave foundation.

## Next Starting Point

Use this as the database handoff note for the next chat thread.

- Current stable DB baseline: attendance-master schema is in place and verified
- Migration-first workflow remains mandatory for all future DB changes
- Next schema work should start from leave foundation, not from more attendance UI polish

Next DB build order:
1. `[ ]` `LeaveType`
2. `[ ]` `LeavePolicy`
3. `[ ]` `LeaveBalanceLedger`
4. `[ ]` Refactor current `Leave` model toward a proper request/approval structure

Instruction for the next thread:
- Read this blueprint and the roadmap first
- Keep current attendance-master tables as baseline
- Implement leave foundation through Prisma migrations, then update services, validators, and frontend
