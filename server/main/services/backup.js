const { exec } = require("child_process");
const path = require("path");

function runBackup() {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = path.join(__dirname, "../scripts/mongoBackup.js"); // adjust path
      exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) {
          console.error("Backup failed:", err);
          reject(err);
        } else {
          console.log("Backup completed:", stdout);
          resolve(stdout);
        }
      });
    } catch (error) {
      console.error("Error starting backup:", error);
      reject(error);
    }
  });
}

module.exports = { runBackup };
