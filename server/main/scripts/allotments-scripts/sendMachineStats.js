// For generating new dates data just change date and change mig id to the one for which you want chart

const mongoose = require('mongoose');

const { getMachineStatModel } = require('../../database/machineStatsModel.js');

const statsConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/machine_monitoring');

async function seedMachineStats() {
  try {
    await statsConnection.asPromise();

    const MachineStat = getMachineStatModel(statsConnection);

    await MachineStat.deleteMany({});

    const data = [];

    const dates = [
      '2026-06-04T09:00:00',
      '2026-06-05T09:00:00',
      '2026-06-06T09:00:00',
      '2026-06-07T09:00:00',
      '2026-06-08T09:00:00',
      '2026-06-09T09:00:00',
    ];

    for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
      const startTime = new Date(dates[dayIndex]);

      for (let i = 0; i < 60; i++) {
        let cpu, mem, gpu;

        // ===== DAY 1 =====
        if (dayIndex === 0) {
          cpu = 18 + Math.floor(Math.random() * 5); // ~20%
          mem = 245 + Math.floor(Math.random() * 10); // ~250%
          gpu = 295 + Math.floor(Math.random() * 10); // ~300%
        }

        // ===== DAY 8 =====
        else if (dayIndex === 7) {
          cpu = 195 + Math.floor(Math.random() * 10); // ~200%
          mem = 115 + Math.floor(Math.random() * 10); // ~120%
          gpu = 28 + Math.floor(Math.random() * 5); // ~30%
        }

        // ===== OTHER DAYS =====
        else {
          cpu = 60 + Math.floor(Math.random() * 11);
          mem = 60 + Math.floor(Math.random() * 11);
          gpu = 60 + Math.floor(Math.random() * 11);

          // random spikes
          if (i % 10 === 0) cpu += 50;
          if (i % 12 === 0) mem += 40;
          if (i % 8 === 0) gpu += 60;
        }

        data.push({
          timestamp: new Date(startTime.getTime() + i * 10000),

          metadata: {
            MIGID: 'MIG-1232131232132132132312312431',
          },

          cpuPerc: Number((cpu / 100).toFixed(2)),

          memUseMiB: Math.floor((mem / 100) * 32768),
          memTotalMiB: 32768,

          gpuVramMiB: Math.floor((gpu / 100) * 19968),
          gpuTotalMiB: 19968,
        });
      }
    }

    await MachineStat.insertMany(data);

    console.log(`${data.length} stats inserted successfully`);

    await statsConnection.close();
  } catch (err) {
    console.error(err);
  }
}

seedMachineStats();
