const { getMachineStatModel } = require('../database/machineStatsModel');
const Machine = require('../database/machineModel');
let MachineStat = null;
const { machineStats } = require('../utils/dockerAPIs/docker.service');

// Convert GiB/MiB strings to MiB
const parseToMiB = (val) => {
  if (!val) return 0;
  const num = parseFloat(val);
  if (val.includes('GiB')) return Math.floor(num * 1024);
  return Math.floor(num);
};

const machines = [
  { name: 'A100', url: process.env.MACHINE_A100 },
  { name: 'H100', url: process.env.MACHINE_H100 },
];

async function collectAndStoreStats(statsConnection) {
  if (!MachineStat) {
    MachineStat = getMachineStatModel(statsConnection);
  }
  const allEntries = [];

  for (const machine of machines) {
    try {
      const data = await machineStats(machine.url);

      if (data.status !== 'success' || !Array.isArray(data.containers)) {
        console.warn(`Unexpected stats format from ${machine.name}:`, data);
        continue;
      }

      // Fetch all Machine docs for this parent machine in one query
      const machineRecords = await Machine.find(
        { name: machine.name },
        { user: 1, MIGID: 1 }
      ).setOptions({ includeUnavailable: true });

      // Build a user -> MIGID lookup map
      const userToMIGID = Object.fromEntries(
        machineRecords.map(m => [m.user, m.MIGID])
      );

      for (const c of data.containers) {
        const MIGID = userToMIGID[c.user];

        if (!MIGID) {
          console.warn(`No MIGID found for user "${c.user}" on ${machine.name}, skipping.`);
          continue;
        }

        allEntries.push({
          timestamp: new Date(),
          parentMachine: machine.name,
          MIGID,
          user: c.user,
          cpuPerc: parseFloat(c.CPUPerc),
          memUseMiB: parseToMiB(c.MemUse),
          memTotalMiB: parseToMiB(c.MemTotal),
          gpuVramMiB: parseToMiB(c.GPUVram),
          gpuTotalMiB: parseToMiB(c.GPUTotal),
        });
      }

    } catch (err) {
      console.error(`Could not fetch stats from ${machine.name}:`, err.message);
    }
  }

  if (allEntries.length > 0) {
    try {
      await MachineStat.insertMany(allEntries);
      console.log(`✅ Stored ${allEntries.length} stat entries.`);
    } catch (dbErr) {
      console.error('❌ Error storing stats to DB:', dbErr.message);
    }
  }
}

module.exports = { collectAndStoreStats };