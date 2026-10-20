# Resolute order data protection

The GitHub Pages repository is **PUBLIC**. It is appropriate for app source code but NOT raw customer records.

## Data separation
- **Public GitHub:** App code, assets, no credentials, no customer personal data.
- **GitHub-safe export:** Order ID, timestamps, status, due date, stick model, redacted workflow events. Order IDs and model choices may still be identifying in combination, so REVIEW before any upload.
- **Private encrypted full backup:** Customer names, contact information, customization specification, assigned staff, notes, and full event history. Export with the "Encrypted private backup" button. This is encrypted locally with AES-GCM using a passphrase-derived key.
- **Storage:** Do not publish even encrypted private backups in the public repo; save them in separately controlled private storage. Store passphrases in a password manager. Losing the passphrase means the backup cannot be recovered.
- **Local tracker:** Uses browser localStorage, not a protected central database. It is a prototype and not suitable for staff-wide access to sensitive customer information.

## Limitations
- GitHub does not automatically receive browser-local orders.
- The tracker cannot confirm that an email/share action was delivered.
- The encrypted backup is download-only and this prototype does not provide encrypted restore.
- Files can be downloaded to devices and could be exposed if those devices/accounts are compromised.
- Never embed a GitHub Personal Access Token in a browser app.
- For production use, use an authenticated backend and encrypted server-side backups, with role permissions, retention and restore tests.

## Shared chart analytics
The tracker now syncs a SHA-256 order key, status, received/updated dates, and deletion markers to Resolute Player Insight's shared database. Its API returns aggregate charts only. Customer names, contact details, specifications, photos, and notes are not sent. Existing local orders sync when the tracker is opened; saved edits and deletions sync, with a retry every 30 seconds. Full order details remain browser-local. GitHub still contains code rather than runtime order records.
