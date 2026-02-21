const fs = require("fs");
const path = require("path");

const logsDir = path.join(process.cwd(), "logs");

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function getAccessLogStream() {
  ensureLogsDir();
  return fs.createWriteStream(path.join(logsDir, "access.log"), { flags: "a" });
}

function writeErrorLog(message) {
  ensureLogsDir();
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(path.join(logsDir, "error.log"), line, "utf8");
}

module.exports = {
  getAccessLogStream,
  writeErrorLog,
};
