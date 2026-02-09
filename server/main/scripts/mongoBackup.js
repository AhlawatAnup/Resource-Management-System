const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const schedule = require("node-schedule");
require('dotenv').config();

const MONGO_DB = process.env.MONGO_DB;
const BACKUP_BASE = process.env.BACKUP_BASE;
const MONGO_DUMP = process.env.MONGO_DUMP;
const RCLONE_PATH = process.env.RCLONE_PATH;
const REMOTE_NAME = process.env.REMOTE_NAME;
const REMOTE_PATH = process.env.REMOTE_PATH;
const LOG_FILE = path.join(BACKUP_BASE, "backup.log");

function getDateTime() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`;
}

function runBackup() {
  const DATETIME = getDateTime();
  const BACKUP_DIR = path.join(BACKUP_BASE, DATETIME);

  // Ensure base and backup directory exist
  if (!fs.existsSync(BACKUP_BASE)) fs.mkdirSync(BACKUP_BASE, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  // Ensure log file directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  console.log(`[${new Date().toLocaleString()}] Starting backup...`);
  // Quote executable paths and target paths so spaces in Windows paths are handled safely
  const dumpCmd = `"${MONGO_DUMP}" --uri="${process.env.MONGO_URI}" --db ${MONGO_DB} --out "${BACKUP_DIR}"`;

  exec(dumpCmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Backup failed: ${err.message}`);
      fs.appendFileSync(LOG_FILE, `${DATETIME} - Backup FAILED\n`);
      return;
    }

    console.log(`✅ Local backup completed at: ${BACKUP_DIR}`);

    // Upload to Google Drive using rclone. Only run if RCLONE_PATH and REMOTE_NAME are set and the rclone binary exists.
    if (RCLONE_PATH && REMOTE_NAME && fs.existsSync(RCLONE_PATH)) {
      const uploadCmd = `"${RCLONE_PATH}" copy "${BACKUP_DIR}" ${REMOTE_NAME}:${REMOTE_PATH}/${DATETIME}`;
      exec(uploadCmd, (uploadErr) => {
        if (uploadErr) {
          console.error(`⚠️ Upload failed: ${uploadErr.message}`);
          fs.appendFileSync(LOG_FILE, `${DATETIME} - Upload FAILED\n`);
        } else {
          console.log(`☁️  Uploaded to Google Drive: ${REMOTE_PATH}/${DATETIME}`);
          fs.appendFileSync(LOG_FILE, `${DATETIME} - Backup successful\n`);
        }
      });
    } else {
      console.log('⚠️  rclone not configured or binary not found; skipping upload.');
      fs.appendFileSync(LOG_FILE, `${DATETIME} - Backup local-only (rclone skipped)\n`);
    }
  });
}

// Run immediately
runBackup();
