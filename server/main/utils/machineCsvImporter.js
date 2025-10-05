const fs = require('fs');
const csv = require('csv-parser');
const Machine = require('../database/machineModel');

/**
 * Import machines from a CSV file path.
 * Expects headers: MIGID,cpuCores,cpuRam,gpuRam (case-insensitive variants allowed)
 * Returns { imported, total }
 */
async function importMachinesFromCsv(filePath) {
  let rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  // Detect case where csv-parser produced a single combined header (happens when
  // the file was uploaded/encoded oddly or a different delimiter is used). Example:
  // rows[0] = { 'MIGID,cpuCores,cpuRam,gpuRam': 'mig-01,16,64,48' }
  if (rows.length > 0 && Object.keys(rows[0]).length === 1) {
    const singleKey = Object.keys(rows[0])[0];
    // if the single key contains commas or semicolons, try reparsing manually
    if (singleKey.includes(',') || singleKey.includes(';')) {
      const delim = singleKey.includes(';') ? ';' : ',';
      const headers = singleKey.split(delim).map(h => h.trim());
      const reparsed = [];
      for (let i = 0; i < rows.length; i++) {
        const val = rows[i][singleKey] || '';
        const parts = val.split(delim).map(p => p.trim());
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = parts[j] !== undefined ? parts[j] : '';
        }
        reparsed.push(obj);
      }
      rows = reparsed;
    }
  }

  const docs = [];
  const skipped = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const MIGID = (r.MIGID || r.migid || r.MigID || '').toString().trim();
    const cpuCores = Number(r.cpuCores || r.cpucores || r.cores);
    const cpuRam = Number(r.cpuRam || r.cpuram || r.cpu_ram);
    const gpuRam = Number(r.gpuRam || r.gpuram || r.gpu_ram || r.gpu);

    const rowNumber = i + 1; // relative to data rows (not including header)

    if (!MIGID) {
      skipped.push({ row: rowNumber, reason: 'missing MIGID', data: r });
      continue;
    }
    if (!Number.isFinite(cpuCores)) {
      skipped.push({ row: rowNumber, reason: 'invalid cpuCores', data: r });
      continue;
    }
    if (!Number.isFinite(cpuRam)) {
      skipped.push({ row: rowNumber, reason: 'invalid cpuRam', data: r });
      continue;
    }
    if (!Number.isFinite(gpuRam)) {
      skipped.push({ row: rowNumber, reason: 'invalid gpuRam', data: r });
      continue;
    }

    docs.push({ MIGID, cpuCores, cpuRam, gpuRam });
  }

  if (docs.length) {
    // use bulkWrite with upsert so existing MIGID rows are updated, new ones inserted
    const ops = docs.map(doc => ({
      updateOne: {
        filter: { MIGID: doc.MIGID },
        update: { $set: doc },
        upsert: true
      }
    }));

    await Machine.bulkWrite(ops, { ordered: false });
  }

  return { imported: docs.length, total: rows.length, skipped };
}

module.exports = importMachinesFromCsv;
