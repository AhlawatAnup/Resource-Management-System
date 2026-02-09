const { exec } = require("child_process");
const path = require("path");

function runBackup() {
  const scriptPath = path.join(__dirname, "../scripts/mongoBackup.js"); // adjust path
  exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
    if (err) console.error("Backup failed:", err);
    else console.log("Backup completed:", stdout);
  });
}

module.exports = { runBackup };
