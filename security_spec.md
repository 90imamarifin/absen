# Security Specification for Attendance App

## 1. Data Invariants
- `students`: Contains the 10 students of the class. Valid roll number (1-50), valid name length (<= 100 chars), valid ID format.
- `attendance_days`: Keyed by date `YYYY-MM-DD`. Contains `records` map with student attendance states: `hadir`, `izin`, `sakit`, `alpa`.
- Denial of wallet guards: Document IDs must adhere to regex patterns; sizes must be bounded.
- Atomic updates: Records can be updated incrementally without corrupting overall class state.

## 2. Dirty Dozen Payload Analysis
1. Oversized student name (> 100 characters): REJECTED.
2. Invalid date format (e.g., `not-a-date`): REJECTED.
3. Negative roll numbers or non-number roll numbers: REJECTED.
4. Non-whitelisted attendance status (e.g. `status: "hacked"`): REJECTED.
5. Injected arbitrary fields outside blueprint: REJECTED.
6. Massive payload attack on records map: REJECTED via size constraints.
7. Path traversal in studentId: REJECTED via `isValidId()`.
8. Path traversal in dateId: REJECTED via date format regex.
9. Deleting collection root: REJECTED.
10. Writing to unmapped collection `/secret_data`: REJECTED by default deny.
11. Malformed JSON payload strings: REJECTED.
12. Null or undefined required fields: REJECTED.
