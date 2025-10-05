const fs = require('fs');
const importMachinesFromCsv = require('./machineCsvImporter');

async function handleMachineCsvFile(filePath) {
  try {
    const result = await importMachinesFromCsv(filePath);
    return result;
  } finally {
    // always try to remove temp file
    fs.unlink(filePath, () => {});
  }
}

module.exports = handleMachineCsvFile;
