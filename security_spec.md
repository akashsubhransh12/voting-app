# Security Specification - Matdaan (ECI Voting Clone)

## 1. Data Invariants
- A **User** cannot modify their own `role` or `isVerified` status once created.
- A **Vote** can only be created if the current user is `isVerified`.
- A **Vote** document ID for a specific election must be the user's `uid` to ensure only one vote per election.
- **Elections** and **Candidates** can only be managed (create/update/delete) by users with the `admin` role.
- **Votes** are immutable once cast.
- The `voteCount` on a `Candidate` is updated via a separate function or increment, but for this clone, we'll ensure that adding a `Vote` requires an atomic update or simply use client-side aggregation for the dashboard (real-time).

## 2. The "Dirty Dozen" Payloads (Testing Denied Operations)

1. **Self-Promotion**: Voter trying to change their role to admin.
   `PATCH /users/voter_123 { "role": "admin" }` -> **DENIED**
2. **Identity Spoofing**: User A trying to vote as User B.
   `POST /elections/e1/votes/user_B { "candidateId": "c1", "userId": "user_B" }` -> **DENIED**
3. **Double Voting**: User trying to overwrite their vote or create a second one under a different ID.
   `POST /elections/e1/votes/alternative_id { "userId": "user_A", "candidateId": "c2" }` -> **DENIED** (id must match uid)
4. **Election Sabotage**: Non-admin trying to end an election early.
   `PATCH /elections/e1 { "status": "completed" }` (by voter) -> **DENIED**
5. **Candidate Injection**: Voter trying to add an unofficial candidate.
   `POST /elections/e1/candidates { "name": "Fake", "party": "None" }` -> **DENIED**
6. **Past Voting**: Creating a vote with a timestamp in the past.
   `POST /elections/e1/votes/user_A { "timestamp": "2000-01-01..." }` -> **DENIED** (must be request.time)
7. **Future Election**: Voting in an election that hasn't started yet.
   `POST /elections/future_e/votes/user_A { ... }` -> **DENIED**
8. **Malicious ID**: Using a 1MB string as a document ID.
   `POST /elections/{...1MB...}/votes/user_A` -> **DENIED** (isValidId check)
9. **Field Pollution**: Adding `isVerified: true` to a vote payload.
   `POST /elections/e1/votes/user_A { "isVerified": true, ... }` -> **DENIED** (Strict keys)
10. **Admin Bypass**: Admin trying to vote twice.
    `POST /elections/e1/votes/admin_uid_2 { ... }` -> **DENIED** (Still bound by 1 vote per UID rule)
11. **PII Leak**: Voter trying to read all user emails.
    `GET /users` (list without filters) -> **DENIED**
12. **Status Short-circuiting**: Changing election from `upcoming` to `completed` skipping `ongoing`.
    `PATCH /elections/e1 { "status": "completed" }` when existing is `upcoming`. -> **DENIED** (State check)

## 3. Test Runner Concept
The `firestore.rules` will be built to fail these payloads.
