const fs = require('fs');
const csv = require('csv-parser');
const Machine = require('../database/machineModel');

async function importMachinesFromCsv(filePath) {
  try {
    const rows = [];

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      throw new Error('CSV file is empty or unreadable.');
    }

    const docs = [];

    for (const r of rows) {
      const MIGID = (r.MIGID || '').trim();
      const gpuRam = Number(r.gpuRam || r.gpuram || r.gpu);

      if (!MIGID) {
        throw new Error('Missing MIGID in one or more rows.');
      }
      if (!Number.isFinite(gpuRam)) {
        throw new Error(`Invalid gpuRam value for MIGID: ${MIGID}`);
      }

      docs.push({ MIGID, gpuRam });
    }

    if (docs.length === 0) {
      throw new Error('No valid machine data found in CSV.');
    }

    const ops = docs.map(doc => ({
      updateOne: {
        filter: { MIGID: doc.MIGID },
        update: { $set: doc },
        upsert: true
      }
    }));

    await Machine.bulkWrite(ops);
    return { ok: true, imported: docs.length };

  } catch (err) {
    console.error('Import failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = importMachinesFromCsv;
