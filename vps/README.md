# Fieldbook VPS

A self-hosted IT acquisition audit workspace. The interface and reports are in English.

## Included

- Plain HTML, CSS and browser JavaScript, with no frontend build or external CDN.
- Node.js server and a local SQLite database at `data/fieldbook.sqlite`.
- Original attachments and report photographs in `data/uploads/`.
- Multiple audits, with 64 independent review prompts across eight IT areas.
- Review results and notes, confirmed findings, risk, improvements, owners and target dates.
- Evidence linked to an area or finding, captions and camera capture; 25 MB per file.
- Word reports containing checklist results, notes, findings, actions and embedded photographs. Other files are listed with authenticated download links.
- Password access, expiring sessions and conflict detection for simultaneous record edits.
- Responsive layout and temporary text drafts kept in the current browser session.

## Run locally

Install Node.js 22.13 or newer. Node 22 may display an experimental SQLite warning. The supplied Docker image uses Node 24.

From this `vps` directory:

```sh
npm ci
npm start
```

Open **http://127.0.0.1:5180**. Without a password, the server listens on loopback only. The database and upload directory are created automatically. Records persist on disk rather than in browser storage.

For password access, copy `.env.example` to `.env`, set a unique `APP_PASSWORD` of at least 12 characters and restart. Keep `.env` private.

## Deploy to a Linux VPS

Choose the Node service or Docker. Configure your own domain and HTTPS reverse proxy. This package has not provisioned or changed a VPS.

### Node service

1. Copy this directory to `/opt/fieldbook`, excluding `node_modules`. Preserve `data` when updating an existing installation.
2. Install Node.js and run `npm ci --omit=dev` in `/opt/fieldbook`.
3. Create a dedicated `fieldbook` system user and a writable `/opt/fieldbook/data` directory owned by that user.
4. Copy `.env.example` to `.env` and configure it:

```dotenv
HOST=127.0.0.1
PORT=5180
DATA_DIR=/opt/fieldbook/data
APP_PASSWORD=replace-with-your-own-long-unique-password
PUBLIC_URL=https://your-audit-domain.example
```

5. Restrict `.env` to the service account, for example owner `fieldbook` and mode `600`.
6. Install `deploy/fieldbook.service` under `/etc/systemd/system/`. Adjust `/usr/bin/node` if needed, then enable it:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now fieldbook
```

7. Add `deploy/nginx-location.conf` inside your domain's HTTPS server block, using real TLS certificates. Check the Nginx configuration before reloading it. Keep the application port on loopback and access it through HTTPS.

Production refuses to start without a password of at least 12 characters. `PUBLIC_URL` must match the external HTTPS origin: it controls secure cookies and attachment links in Word.

### Docker

Configure `.env` with a real `APP_PASSWORD` and HTTPS `PUBLIC_URL`, then run:

```sh
docker compose up -d --build
```

The compose file binds port 5180 to loopback and persists SQLite and uploads in the `fieldbook-data` named volume. Put the HTTPS reverse proxy in front of it. Preserve the volume during updates.

## Audit workflow

1. Choose **New audit**, enter the site profile and save.
2. Open an area in **Overview** or the sidebar.
3. Select **Review check**, record observations and choose Not reviewed, Pass, Issue or Not applicable.
4. Use **Record finding** to start from a suggested title, risk and improvement. Add observed facts before saving. The finding and checklist result are separate records; changing one does not silently change the other.
5. Use **Evidence** to upload photographs, plans, Excel, PDFs or other files. Assign an area or finding and write a caption.
6. Track owners, dates and resolution in **Findings**.
7. Add an executive summary through **Edit site details**, then choose **Report → Export Word report**.

Prompts are not automatically counted as confirmed findings. Every new audit starts with all checks unreviewed.

Image uploads are converted to PNG previews for Word embedding. JPEG, PNG, WebP and TIFF are supported by the normal image pipeline; undecodable images are rejected with a conversion request. Other originals are kept without alteration. Reports do not extract spreadsheet cells or PDF pages into the body; those originals remain linked attachments.

Text drafts survive page reloads in the same browser session and can be reopened through **Resume draft**. They are temporary and are not shared between devices. Saving, uploading and generating reports require a connection to the server. This release does not provide full offline operation or an upload queue.

## Backups and restore

SQLite uses foreign keys, WAL mode and a versioned schema. Do not edit the database while the service is running.

For a Node installation, stop the service before copying the database and its associated files:

```sh
sudo systemctl stop fieldbook
cd /opt/fieldbook
npm run backup
sudo systemctl start fieldbook
```

The backup command writes a SQLite snapshot and copies uploads to `backups/<timestamp>/`. Use an account that can read `data` and write `backups`. Stopping the service keeps the attachment copy consistent with the snapshot.

To restore, stop the service, copy the snapshot's `fieldbook.sqlite` and `uploads/` into a clean data directory, set ownership for the service user, and point `DATA_DIR` to it. Do not put a restored database beside stale `-wal` or `-shm` files. Keep the previous data directory until recovery is verified. For Docker, back up and restore the volume with the container stopped.

**Download JSON** exports text and attachment metadata. It is not a complete backup and contains no attachment bytes. There is no JSON import screen in this release.

## Checklist contents

| Area | Main topics |
| --- | --- |
| Site & facilities | Access, UPS, environment, fire/water, racks, plans, assets, contacts |
| Network & connectivity | Diagrams, WAN, segmentation, firewall, wireless, lifecycle, configuration recovery, remote access |
| Servers & cloud | Inventory, support, backups, restores, capacity, identity, cloud ownership, privileges |
| Cybersecurity | MFA, endpoint protection, patching, account lifecycle, logging, incident response, encryption, awareness |
| Workplace & applications | Devices, management, licences, critical apps, collaboration, patching, peripherals, user data |
| OT & production | Industrial inventory, boundaries, vendors, controller backups, legacy systems, dependencies, changes, removable media |
| IT operations | Support, suppliers, documentation, incidents, changes, continuity, budget, retention |
| Integration roadmap | Day one, containment, transition services, target architecture, migrations, investment, milestones, handover |

These original practical prompts are informed by [NIST CSF 2.0](https://www.nist.gov/cyberframework) and [CISA guidance](https://www.cisa.gov/stopransomware/ransomware-guide), supplemented with acquisition integration topics. They are not a certification or legal assessment. Coordinate OT reviews with plant owners; this app performs no scans or industrial changes.

## Verification

```sh
npm test
```

The integration test uses a separate temporary SQLite database. It checks authentication, all 64 prompts, independent audits, reviews, finding edits, stale-write conflicts, uploads, access protection, invalid images, restart persistence, deletion, and Word text and embedded image content. It inserts no test audits into your workspace.

Browser interaction and mobile visual testing have not been performed here. The Docker and Linux service configurations have not been executed against a VPS.

## Earlier Sites version

This is a standalone VPS edition. The original Sites source and published application remain separate. Existing cloud data has not been downloaded or migrated to SQLite. Copy only this directory to the VPS; the parent Cloudflare and Sites configuration is unnecessary.
