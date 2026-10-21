const machines = require('./machineModel');

exports.fetchAllMachines = async () => {
  const machinesArr = await machines.find().lean();
  return machinesArr;
};
