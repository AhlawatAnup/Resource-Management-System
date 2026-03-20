// migController.js
const Machine = require('../../database/machineModel');

exports.getMachineByMigid = async (migid) => {
    const machine = await Machine.findOne({ MIGID: migid }).lean(); // lean() returns plain JS object
    if (!machine) {
        throw new Error("Machine not found for MIGID: " + migid);
    }
    return machine;
};