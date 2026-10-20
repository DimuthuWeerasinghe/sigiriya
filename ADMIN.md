# Local administration

The admin area is at `/admin`. It supports username/password authentication, a dashboard, enquiries and requests, PDF document management, and a searchable, paginated activity log.

## First setup

Run `npm run admin:setup` from the project root, then restart `npm run dev`. Setup applies local D1 migrations, generates an audit signing key in ignored `.dev.vars`, and creates the first administrator with a randomly generated password. Save the printed password in a password manager; it is not saved in plaintext. Re-running setup does not overwrite an existing account.

Local database data persists in ignored `.wrangler/state`. Keep `.dev.vars` and the database together when backing up. Losing or replacing `ADMIN_AUDIT_KEY` prevents verification of existing records. Setup is a trusted operator command, not an unauthenticated web endpoint.

`npm run build` builds the server Worker. `npm start` previews that build locally on loopback through Wrangler, sharing the same local database. Pass `npm start -- --port 3002` to use another port. The plain Node `vinext start` server cannot provide Cloudflare bindings, so the start helper uses the Worker runtime and keeps local secrets outside the build output.

## Enquiries, requests and replies

Contact and complaint forms save the visitor's name, email, optional phone number, subject, category and initial message in D1. Each receives a reference number and random private access code. Only the access-code hash is stored; the plain code appears once in the submission response and private tracking link. The code travels in a URL fragment, not in the server URL. Tracking/replies use same-origin POST requests and database-backed rate limits.

Visitors use `/track` to read their conversation, status and staff replies, and to send follow-ups. Messages are exchanged on this website; there is no email delivery or notification service. The email address is retained for council reference.

Administrators use `/admin/inbox` to search/filter records, read their history, send replies, change priority/status, and archive/reopen conversations. Archiving retains all messages. Original messages cannot be edited or deleted. Concurrent stale status updates are rejected instead of silently overwriting newer changes.

## Documents

Administrators use `/admin/documents` to upload PDFs up to 5 MiB, edit title/description/category/language/year, publish/unpublish, and archive/restore records. Draft and archived files require an administrator session. Published files appear both on `/downloads` and in the homepage library. Search and category filters query the database.

As requested, both file bytes and metadata are saved in D1, not browser storage or an external bucket. Files are split into immutable 256 KiB BLOB rows and streamed back with per-chunk and whole-file SHA-256 checks. This stays below [D1's per-row limit](https://developers.cloudflare.com/d1/platform/limits/). Downloads use attachment disposition and nosniff headers. PDF header/end-marker, filename, metadata and body-size validation run server-side; upload limits also appear in the UI. The framework multipart cap is 6 MiB, while this API separately enforces the 5 MiB file limit.

Archiving removes a file from public listings/downloads while retaining its bytes. To replace a PDF, upload a new document and archive the previous record. The download counter records download requests, not proof of completed transfers.

## Credential changes

`scripts/change-admin-credentials.mts` is a trusted local operator utility. It takes username/password JSON through hidden stdin, saves only a salted password hash, revokes existing sessions and appends an activity event. It does not weaken the default password policy for account provisioning. The requested local credentials were applied through this utility.

## Security and activity history

- Passwords use salted scrypt (N=32768, r=8, p=3); raw passwords and session tokens are never written to the activity log.
- Every protected page and API request checks the server-side session. Random session tokens are stored as SHA-256 hashes. Cookies are HttpOnly, SameSite=Strict, and Secure on HTTPS.
- Sessions expire after 30 minutes idle or eight hours absolute. Logout revokes the session immediately.
- Login validation runs in the browser and on the server. Database-backed limits allow five attempts per account and 25 per source in 15 minutes. Use HTTPS for hosting.
- Mutations require a same-origin request; authenticated mutations also require the session's CSRF token. All database inputs use bound parameters.
- Authentication events, log views, integrity checks, credential changes, submissions, replies, inbox access, status changes, document uploads/publication/archive actions and download requests are recorded. Application data changes and their activity entry commit together in one D1 batch. Message bodies, private access codes and passwords are not copied into the audit log.
- There is no edit/delete capability for activity records. Authenticated attempts to mutate the activity endpoint are blocked and recorded. SQLite triggers reject updates/deletions and enforce append order. Each entry has an HMAC signature linked to the previous entry; use **Verify integrity** to check the chain.

An application administrator cannot delete records. A person who controls database/hosting infrastructure can drop tables or triggers, restore an older database, or replace the database and signing key. HMAC verification alone cannot detect a consistent rollback of both storage and key. Protection against those owners additionally requires an independently controlled, immutable external log archive or retention service; this project does not claim to supply that guarantee.

## Hosting

Authentication needs the server Worker and D1 database. A static HTML export or the old InfinityFree export folder cannot run this admin backend. The project no longer sets Next's `output: 'export'`. No hosting deployment is performed by local setup.

Before a later server deployment, provision the `DB` binding, apply `db/migrations`, securely configure the existing `ADMIN_AUDIT_KEY` runtime secret, and provision the administrator in that environment. Local accounts/data are not automatically copied to hosting. Keep admin responses out of intermediary caches.

## Verification

`npm run test:admin` checks authentication validation, password hashing, cookies, request-origin protection, signatures, and the actual SQL constraints/triggers in a temporary in-memory SQLite database. It does not modify the local administrator's data.

The optional `tests/admin-live.mts` check takes credentials through stdin and exercises the running server. Its login attempts and verification actions remain in the activity log.

`npm run test:workspace` checks public form/document validation and real schema constraints in temporary SQLite. `tests/workspace-live.mts` exercises the complete messaging and file workflows. Its verification records are archived rather than deleted. With `--persistence-only`, it reopens the saved fixture after server restart, checks original file bytes, and verifies the activity chain. Credentials and private access codes are never saved by these tests.

Runtime references: [Cloudflare Node crypto support](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/), [D1 local storage](https://developers.cloudflare.com/d1/best-practices/local-development/), [local secret configuration](https://developers.cloudflare.com/workers/configuration/secrets/).
