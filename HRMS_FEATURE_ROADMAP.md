# HRMS Feature Roadmap

This file is the working roadmap for expanding the HRMS into a more industry-usable product.

Status guide:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

## Phase 1: Core Attendance And Daily HR Operations

### 1. Attendance foundation
- `[x]` User check-in and check-out
- `[x]` Work mode selection: `WFH`, `Office`, `Other`
- `[x]` Monthly attendance drawer with month-wise blocks
- `[x]` Super Admin attendance exemption
- `[x]` Attendance regularization request
- `[x]` Late mark and half-day calculation
- `[x]` Overtime tracking and approval
- `[ ]` Attendance remarks and manual HR correction
- `[ ]` Holiday and weekly-off attendance handling

### 2. Manager attendance workflow
- `[x]` Reporting manager mapping
- `[ ]` Team attendance today widget
- `[ ]` Missed check-in alerts for managers
- `[x]` Approve or reject attendance correction requests
- `[x]` Team monthly attendance review

### 3. Leave management
- `[ ]` Leave types: casual, sick, earned, unpaid
- `[ ]` Leave balance tracking
- `[ ]` Leave request and approval workflow
- `[ ]` Leave cancellation flow
- `[ ]` Holiday calendar integration
- `[ ]` Sandwich policy support
- `[ ]` Carry-forward and expiry rules

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
- `[ ]` Employee lifecycle status: active, probation, notice, exited
- `[ ]` Employee skill tags and designations

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
4. `[ ]` Leave balance tracking
5. `[ ]` Leave request and approval workflow
6. `[ ]` Holiday calendar
7. `[x]` Late mark / half-day / overtime rules
8. `[ ]` Attendance to payroll integration
9. `[ ]` Employee self-service profile and documents
10. `[ ]` Manager dashboard

## Current Focus Suggestions

If we want to continue development in the best sequence, start here:

### Sprint A
- `[x]` Reporting manager mapping
- `[x]` Attendance regularization request
- `[x]` Attendance approval by manager / HR

### Sprint B
- `[ ]` Leave balances
- `[ ]` Leave request flow
- `[ ]` Holiday calendar

### Sprint C
- `[x]` Late mark / half-day / overtime
- `[ ]` Payroll attendance linkage
- `[ ]` Manager dashboard

## Notes

- `PROJECT_MANAGER` is currently the closest available role to act like a manager.
- If we want real reporting structures, we should add `managerId` or a reporting hierarchy to the user model.
- Overtime tracking and approval is now implemented on attendance records with manager / HR review.
- Most industry-ready HRMS workflows depend on approval chains, holiday logic, and payroll rules.
