const { fetchAllMachines } = require('./database/mayaDB.js');

class Maya {
  constructor() {
    this._machines = [];
    this.setMachines();
  }

  async setMachines() {
    const fetchedMachines = await fetchAllMachines();

    const seenIps = new Set();
    this._machines = fetchedMachines
      .filter((machine) => {
        if (seenIps.has(machine.ip)) return false;
        seenIps.add(machine.ip);
        return true;
      })
      .map((machine) => ({
        name: machine.name,
        url: `http://${machine.ip}:9999`,
      }));
  }
}

module.exports = { Maya };
