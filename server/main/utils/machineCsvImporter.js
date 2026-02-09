const fs = require('fs');
const csv = require('csv-parser');
const Machine = require('../database/machineModel');

async function importMachinesFromCsv(filePath) {
  try {
    const rows = [];
    const normalizeKey = (key) => (key || '')
      .toString()
      .replace(/\r/g, '')
      .trim()
      .toLowerCase();

    const normalizeVal = (val) => (val == null ? '' : val)
      .toString()
      .replace(/\r/g, '')
      .trim();

    const parseNumberSafe = (val) => {
      const v = normalizeVal(val);
      if (!v) return NaN;
      const n = Number(v);
      return Number.isFinite(n) ? n : NaN;
    };

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const cleaned = {};
          for (const [k, v] of Object.entries(data)) {
            const nk = normalizeKey(k);
            if (!nk) continue;
            cleaned[nk] = normalizeVal(v);
          }
          rows.push(cleaned);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      throw new Error('CSV file is empty or unreadable.');
    }

    const docs = [];

    for (const r of rows) {
      const MIGID = normalizeVal(r.migid || r.mig_id || r.mig);
      const gpuRam = parseNumberSafe(r.gpuram || r.gpu_ram || r.gpu || r.gpu_memory);

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
    return { ok: true, imported: docs.length, total: rows.length, skipped: [] };

  } catch (err) {
    console.error('Import failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = importMachinesFromCsv;
