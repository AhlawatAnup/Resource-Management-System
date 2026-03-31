const { getMachineStatModel } = require('../database/machineStatsModel');
let MachineStat = null;
const { machineStats } = require('../utils/dockerAPIs/docker.service');

// Convert GiB/MiB strings to integer MiB
const parseToMiB = (val) => {
  if (!val) return 0;
  const num = parseFloat(val);
  if (val.includes('GiB')) return Math.floor(num * 1024);
  return Math.floor(num); // Already MiB or %
};

// Define machines from .env
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

      if (data.status === 'success' && Array.isArray(data.containers)) {
        data.containers.forEach(c => {
          allEntries.push({
            timestamp: new Date(),
            user: c.user,
            cpuPerc: parseFloat(c.CPUPerc),
            memUseMiB: parseToMiB(c.MemUse),
            memTotalMiB: parseToMiB(c.MemTotal),
            gpuVramMiB: parseToMiB(c.GPUVram),
            gpuTotalMiB: parseToMiB(c.GPUTotal),
          });
        });
      } else {
        console.warn(`Unexpected stats format from ${machine.name}:`, data);
      }

    } catch (err) {
      console.error(`Could not fetch stats from ${machine.name}:`, err.message);
    }
  }

  if (allEntries.length > 0) {
    try {
      await MachineStat.insertMany(allEntries);
      console.log(`✅ Successfully stored ${allEntries.length} stat entries for all machines.`);
    } catch (dbErr) {
      console.error('❌ Error storing stats to DB:', dbErr.message);
    }
  }
}

module.exports = { collectAndStoreStats };