/**
 * MongoDB Backup Script (Node.js + PM2)
 * - Runs backup immediately on start
 * - Schedules backup daily at 3 AM
 * - Uses same folder structure as your .bat file
 * - Optionally uploads to Google Drive via rclone
 */

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const schedule = require("node-schedule");

const MONGO_DB = "college_resources";
const BACKUP_BASE = "C:\\MongoBackup\\backup\\mongo";
const MONGO_DUMP = `"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe"`;
const RCLONE_PATH = `"C:\\MongoBackup\\Tools\\rclone-v1.71.1-windows-amd64\\rclone.exe"`;
const REMOTE_NAME = "mygdrive";
const REMOTE_PATH = "MongoBackups";
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

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  console.log(`[${new Date().toLocaleString()}] Starting backup...`);
  const dumpCmd = `${MONGO_DUMP} --db ${MONGO_DB} --out "${BACKUP_DIR}"`;

  exec(dumpCmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Backup failed: ${err.message}`);
      fs.appendFileSync(LOG_FILE, `${DATETIME} - Backup FAILED\n`);
      return;
    }

    console.log(`✅ Local backup completed at: ${BACKUP_DIR}`);

    // Upload to Google Drive using rclone
    const uploadCmd = `${RCLONE_PATH} copy "${BACKUP_DIR}" ${REMOTE_NAME}:${REMOTE_PATH}/${DATETIME}`;
    exec(uploadCmd, (uploadErr) => {
      if (uploadErr) {
        console.error(`⚠️ Upload failed: ${uploadErr.message}`);
        fs.appendFileSync(LOG_FILE, `${DATETIME} - Upload FAILED\n`);
      } else {
        console.log(`☁️  Uploaded to Google Drive: ${REMOTE_PATH}/${DATETIME}`);
        fs.appendFileSync(LOG_FILE, `${DATETIME} - Backup successful\n`);
      }
    });
  });
}

// Run immediately
runBackup();

// Schedule daily at 3:00 AM
schedule.scheduleJob("0 3 * * *", runBackup);
