# MRERR Auth — Authentication Mechanics

The MRERR Platform supports standard email and password authentication provided natively by Better Auth.

## Registration & Login Workflow
* **Registration**: Users submit full names, emails, and passwords on the client form. The client calls `authClient.signUp.email()`. Account is created, password is securely hashed via bcrypt/scrypt by Better Auth, and email verification is triggered.
* **Email Verification**: A verification record is saved to the database. The development email adapter catches the callback and prints the verification URL to standard output. Upon visiting the URL, the account is verified.
* **Sign In**: Verified users submit credentials. The client calls `authClient.signIn.email()`. Upon successful credential checking, a secure HTTP-Only Lax cookie is issued to the browser.
* **Password Reset**: If requested, a password reset token is logged to stdout. This link can be visited by the local developer to securely complete a password update.

## User identity
The `users` table serves as the authoritative source of user credentials and profiles. Sibling tables may reference the `user.id` foreign key for resource ownership checks in future phases (e.g. `project.createdBy`).
