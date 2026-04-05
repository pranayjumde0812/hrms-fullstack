# HRMS Feature Roadmap

This file is the working roadmap for expanding the HRMS into a more industry-usable product.

Status guide:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

## Current Product Baseline

These are the foundations already available in the product and should be treated as the base for all upcoming work:

### Attendance and approvals already built
- `[x]` User check-in and check-out
- `[x]` Work mode capture
- `[x]` Monthly attendance history
- `[x]` Attendance regularization requests
- `[x]` Attendance regularization review
- `[x]` Overtime calculation and approval
- `[x]` Manual HR attendance correction
- `[x]` Holiday master
- `[x]` Weekly-off handling with default Saturday / Sunday rule

### Reporting and user structure already built
- `[x]` Role-based users: `SUPER_ADMIN`, `HR_MANAGER`, `PROJECT_MANAGER`, `EMPLOYEE`
- `[x]` Department assignment
- `[x]` Reporting manager mapping using `managerId`
- `[x]` Manager-based attendance review using reporting structure

### Modules already present but still basic
- `[~]` Leave module exists, but policy, balances, and approval chain are still basic
- `[~]` Payroll module exists, but attendance-linked payroll rules are not ready
- `[~]` Dashboard and manager views exist, but are not yet fully operational for HRMS use

## Phase-Wise Development Flow

Follow development in this order so every new feature sits on a stable base:

1. **Phase 1A: Stabilize the current attendance base**
   Convert hardcoded attendance rules into configurable company policy.

2. **Phase 1B: Build shared HR masters**
   Finalize holiday, weekly-off, work location, lifecycle, and employment classification data used across modules.

3. **Phase 1C: Complete leave policy and approval logic**
   Build leave on top of reporting structure, balances, and policy rules.

4. **Phase 1D: Connect attendance and leave to payroll**
   Only after attendance and leave become reliable.

5. **Phase 2 onward**
   Dashboards, self-service, reports, shifts, assets, onboarding, integrations.

## Shared Masters And Cross-Module Dependencies

These should be treated as shared foundations, not isolated features:

### Shared masters
- Holiday calendar
- Weekly-off configuration
- Attendance policy settings
- Employee lifecycle status
- Employment type
- Work location / branch / legal entity
- Reporting manager structure

### Must be ready before payroll
- Attendance policy settings
- Absent auto-marking
- Holiday calendar and weekly-off rules
- Leave policy master
- Leave balance ledger
- Leave approval workflow
- Employee lifecycle status
- Employment type / work location where payroll rules depend on them

### Can wait until Phase 2
- Employee self-service documents
- Downloadable letters
- Advanced manager dashboard widgets
- Reports and exports
- Notifications
- Integrations

## Phase 1: Core Attendance And Daily HR Operations

### 1. Attendance foundation
- `[x]` User check-in and check-out
- `[x]` Work mode selection: `WFH`, `Office`, `Other`
- `[x]` Monthly attendance drawer with month-wise blocks
- `[x]` Super Admin attendance exemption
- `[x]` Attendance regularization request
- `[x]` Late mark and half-day calculation
- `[x]` Overtime tracking and approval
- `[x]` Attendance remarks and manual HR correction
- `[x]` Holiday and weekly-off attendance handling
- `[x]` Attendance policy configuration: office start time, grace time, half-day threshold, standard hours
- `[ ]` Employee timezone and company timezone handling
- `[ ]` Missing attendance / absent auto-marking job after day close
- `[x]` Attendance source tagging: web, manual correction, regularization, import
- `[~]` Attendance audit trail for every status or time change

### 2. Manager attendance workflow
- `[x]` Reporting manager mapping
- `[ ]` Team attendance today widget
- `[ ]` Missed check-in alerts for managers
- `[x]` Approve or reject attendance correction requests
- `[x]` Team monthly attendance review
- `[ ]` Manager can only review direct and delegated reports
- `[ ]` Multi-level approval fallback when employee has no manager

### 3. Leave management
- `[ ]` Leave types: casual, sick, earned, unpaid
- `[ ]` Leave balance tracking
- `[ ]` Leave request and approval workflow
- `[ ]` Leave cancellation flow
- `[ ]` Holiday calendar integration
- `[ ]` Sandwich policy support
- `[ ]` Carry-forward and expiry rules
- `[ ]` Leave policy master: annual quota, accrual, encashment, gender / probation / location rules
- `[ ]` Leave balance ledger with credit, debit, adjustment entries
- `[ ]` Partial-day leave support
- `[ ]` Backdated leave request rules and cutoff window
- `[ ]` Leave approver chain: manager first, HR override
- `[ ]` Prevent overlap with attendance and holidays

## Phase 2: Real-World Employee And Manager Self-Service

### 4. Employee self-service
- `[ ]` Employee profile management
- `[ ]` Emergency contact details
- `[ ]` Bank details and payroll info
- `[ ]` Document upload and verification
- `[ ]` Download letters: offer, experience, payslips
- `[ ]` Personal attendance and leave dashboard

### 5. Department and people management
- `[ ]` Reporting hierarchy
- `[ ]` Department heads and team ownership
- `[ ]` Employee transfer between departments
- `[x]` Employee lifecycle status: active, probation, notice, exited
- `[ ]` Employee skill tags and designations
- `[x]` Employment type: full-time, intern, contractor, consultant
- `[x]` Work location / branch / legal entity tagging

### 6. Manager dashboard
- `[ ]` Team on leave today
- `[ ]` Team late arrivals
- `[ ]` Team WFH vs office split
- `[ ]` Pending approvals summary
- `[ ]` Monthly team attendance trends

## Phase 3: Payroll And Compliance

### 7. Attendance to payroll integration
- `[ ]` Paid days calculation
- `[ ]` Loss of pay calculation
- `[ ]` Overtime payout rules
- `[ ]` Leave deduction rules
- `[ ]` Attendance-based payroll summary

### 8. Payroll operations
- `[ ]` Salary structure breakdown
- `[ ]` Monthly payslip generation
- `[ ]` Bonus and incentive entries
- `[ ]` Deduction management
- `[ ]` Reimbursement claims
- `[ ]` Payroll lock and approval flow

### 9. Compliance and audit
- `[ ]` PF / ESI / PT / TDS fields
- `[ ]` Contract and document expiry alerts
- `[ ]` Audit logs for HR actions
- `[ ]` Policy acknowledgement tracking
- `[ ]` Role-based access audit

## Phase 4: Industry-Ready Operations

### 10. Shift and roster management
- `[ ]` Shift master
- `[ ]` Employee shift assignment
- `[ ]` Rotational rosters
- `[ ]` Night shift handling
- `[ ]` Grace period rules
- `[ ]` Weekly off patterns

### 11. Recruitment and onboarding
- `[ ]` Candidate tracking
- `[ ]` Interview stages
- `[ ]` Offer release workflow
- `[ ]` Joining checklist
- `[ ]` New hire onboarding tasks

### 12. Exit management
- `[ ]` Resignation workflow
- `[ ]` Notice period tracking
- `[ ]` Exit checklist
- `[ ]` Full and final settlement support
- `[ ]` Asset return confirmation

### 13. Asset management
- `[ ]` Asset issue and return
- `[ ]` Laptop, ID card, accessories tracking
- `[ ]` Software license assignment
- `[ ]` Asset history by employee

## Phase 5: Reporting, Integrations, And Enterprise Use

### 14. Reports and exports
- `[ ]` Attendance export to Excel
- `[ ]` Leave report export
- `[ ]` Payroll export
- `[ ]` Department-wise analytics
- `[ ]` Custom filters by date, employee, department

### 15. Notifications
- `[ ]` Email notifications
- `[ ]` In-app alerts
- `[ ]` Missed check-in reminders
- `[ ]` Approval reminders
- `[ ]` Leave balance alerts

### 16. Integrations
- `[ ]` Biometric device sync
- `[ ]` Accounting/payroll system integration
- `[ ]` ERP integration
- `[ ]` Slack/Teams notifications
- `[ ]` Calendar sync for leave and holidays

## Recommended Build Order

Build these first for the fastest jump in real-world usability:

1. `[x]` Reporting manager mapping
2. `[x]` Attendance regularization request
3. `[x]` Attendance approval flow
4. `[x]` Attendance policy configuration
5. `[ ]` Missing attendance / absent auto-marking job
6. `[ ]` Leave policy master and balance ledger
7. `[ ]` Leave request and approval workflow
8. `[ ]` Holiday calendar
9. `[x]` Late mark / half-day / overtime rules
10. `[ ]` Attendance to payroll integration
11. `[x]` Employee lifecycle status and employment type
12. `[ ]` Employee self-service profile and documents
13. `[ ]` Manager dashboard

## Execution Plan Based On Current Progress

This sequence takes the current product state into account and should be followed phase by phase.

### Phase 1A: Stabilize attendance base
- `[x]` Reporting manager mapping
- `[x]` Attendance regularization request
- `[x]` Attendance approval by manager / HR
- `[x]` Late mark / half-day / overtime
- `[x]` Holiday master and weekly-off handling
- `[x]` Attendance policy settings
- `[ ]` Manager can review only direct or delegated reports
- `[ ]` Approval fallback when reporting manager is missing
- `[ ]` Absent auto-marking
- `[x]` Attendance source tagging
- `[~]` Attendance audit trail
- `[ ]` Employee timezone and company timezone handling

### Phase 1B: Build shared HR masters
- `[~]` Holiday calendar as shared master for attendance, leave, and payroll
- `[x]` Weekly-off configuration by company, location, shift, or employee
- `[x]` Employee lifecycle status
- `[x]` Employment type
- `[x]` Work location / branch / legal entity tagging
- `[ ]` Reporting hierarchy cleanup
- `[ ]` Department heads and team ownership

### Phase 1C: Complete leave foundation
- `[ ]` Leave types and leave policy master
- `[ ]` Leave policy and balance ledger
- `[ ]` Leave balance tracking
- `[ ]` Leave request flow
- `[ ]` Leave approval chain: manager first, HR override
- `[ ]` Leave cancellation flow
- `[ ]` Partial-day leave
- `[ ]` Backdated leave rules
- `[ ]` Sandwich policy
- `[ ]` Carry-forward and expiry rules
- `[ ]` Leave and attendance overlap prevention

### Phase 1D: Prepare payroll-ready operations
- `[ ]` Payroll attendance linkage
- `[ ]` Paid days calculation
- `[ ]` Loss of pay calculation
- `[ ]` Leave deduction rules
- `[ ]` Overtime payout rules
- `[ ]` Attendance-based payroll summary

### Phase 2A: Operational dashboards and self-service
- `[ ]` Manager dashboard
- `[ ]` Team attendance today widget
- `[ ]` Team on leave today
- `[ ]` Team late arrivals
- `[ ]` Pending approvals summary
- `[ ]` Employee self-service profile and documents
- `[ ]` Personal attendance and leave dashboard

## What To Develop First Right Now

If we continue from the current codebase, build these next without skipping:

1. `[x]` Attendance policy settings
2. `[ ]` Absent auto-marking
3. `[ ]` Manager review scope and approval fallback
4. `[ ]` Holiday calendar and weekly-off configuration as shared master
5. `[x]` Employee lifecycle + employment type + work location basics
6. `[ ]` Leave policy master
7. `[ ]` Leave balance ledger
8. `[ ]` Leave request and approval workflow

## Next Starting Point

Use this section as the handoff note for the next chat thread.

- Current stable baseline: attendance-master phase is completed and smoke-tested
- Frontend and backend are aligned for work locations, attendance policies, weekly-off rules, holiday master updates, and employee master fields
- Current phase should be treated as frozen unless a bug is found

Next module to start:
- Leave Foundation

Build order for the next thread:
1. `[ ]` `LeaveType`
2. `[ ]` `LeavePolicy`
3. `[ ]` `LeaveBalanceLedger`
4. `[ ]` Refactor current leave request flow into policy-based approval flow

Instruction for the next thread:
- Read `HRMS_FEATURE_ROADMAP.md` and `HRMS_DATABASE_BLUEPRINT.md` first
- Treat attendance-master work as stable baseline
- Start from leave database design and migration-first backend changes before frontend expansion

## Development Rule To Follow

For each module, develop in this order:

1. `Master / policy`
2. `Workflow / transaction`
3. `Approval`
4. `Calculation`
5. `Dashboard / report`

Example for leave:

1. Leave policy master
2. Leave balance ledger
3. Leave request
4. Leave approval / cancellation
5. Leave deduction and dashboard

## Notes

- Database changes should always follow Prisma migration files, not ad-hoc schema pushes.
- Current attendance-master phase has been smoke-tested against a running backend after frontend wiring, and the weekly-off rule runtime mismatch was fixed.
- `managerId` is now the correct base for reporting structure, which is closer to industry practice than relying only on `PROJECT_MANAGER`.
- `PROJECT_MANAGER` should not be treated as the only manager role; approval authority should come from reporting structure and role permissions together.
- Current roles are acceptable for Phase 1, but Phase 2 should likely add `ADMIN / HR_EXECUTIVE`, `TEAM_LEAD`, and possibly `FINANCE / PAYROLL`.
- Leave types and statuses should move from plain strings toward enums or master tables before payroll and policy logic becomes more complex.
- Overtime tracking and approval is now implemented on attendance records with manager / HR review.
- Holiday master is now available, and weekly offs are currently handled with a default Saturday / Sunday rule.
- Weekly off should become configurable by company, location, shift, or employee before payroll rollout.
- Industry-ready Phase 1 usually also requires auditability, policy configurability, and a clean approval fallback path, not just CRUD flows.
- Most industry-ready HRMS workflows depend on approval chains, holiday logic, and payroll rules.
