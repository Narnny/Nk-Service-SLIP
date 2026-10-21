# Security Specification: NK Service Deposit Receipts System

## 1. Data Invariants
1. Only authenticated users can access receipts and customer records.
2. Receipts must have valid document IDs (`isValidId`) and conform to the `Receipt` blueprint schema.
3. Every receipt must have a valid `userId` matching the creator's UID (`request.auth.uid`) on creation.
4. Immortality: `receiptNo`, `userId`, `createdAt` cannot be altered upon update.
5. All string fields must adhere to strict size boundaries (`.size() <= MAX`).
6. Total amount must be non-negative number.
7. Customers collection contains customer contact info; reads/writes are restricted to authenticated staff members.
8. User profile modification is restricted to the user themselves or system administrators.
9. Roles in user profiles cannot be arbitrarily modified by regular users.
10. The bootstrapped admin `narnny1994nk@gmail.com` has elevated administrative rights.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Ghost Field Injection**: Attempt to create a receipt with `{ isHacked: true }`
2. **Identity Spoofing**: User A creating a receipt with `userId: "user_B"`
3. **Id Poisoning**: Writing to document ID with oversized characters or junk scripts `receipts/../../../etc`
4. **Amount Poisoning**: Passing negative numbers or non-numeric types for `totalAmount`
5. **Denial of Wallet**: Passing a 2MB string into `customerName`
6. **Immutable Field Tampering**: Modifying `receiptNo` or `createdAt` after creation
7. **Status Shortcut/Poisoning**: Passing invalid status enum `status: "deleted_forever"`
8. **Unauthenticated Read**: Attempting to read `receipts` without authentication token
9. **Unauthenticated Write**: Creating receipts as an unverified anonymous guest
10. **Role Escalation**: Regular user updating their own profile to `role: "admin"`
11. **Client Delegation Bypass**: Attempting to query someone else's private data without proper bounds
12. **PII Harvesting**: Non-authenticated or unauthorized reads against `/customers`

## 3. Security Rule Verification
All payloads must return `PERMISSION_DENIED`. Rules enforce:
- Default Deny catch-all at root
- Schema validation functions (`isValidReceipt`, `isValidCustomer`, `isValidUser`)
- Action-based update permissions
- Size and regex guards on all IDs and string fields
