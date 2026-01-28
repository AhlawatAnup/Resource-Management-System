const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure tmp directory exists and export a configured multer instance
const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const upload = multer({ dest: tmpDir, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

module.exports = { upload, tmpDir };
