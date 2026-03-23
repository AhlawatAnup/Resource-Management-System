const mongoose = require('mongoose');
const Machine = require('../../database/machineModel');
const MachineAllotment = require('../../database/machineAllotmentModel.js');

exports.getMachineByMigid = async (migid) => {
    const machine = await Machine.findOne({ MIGID: migid }).lean(); // lean() returns plain JS object
    if (!machine) {
        throw new Error("Machine not found for MIGID: " + migid);
    }
    return machine;
};

exports.getTokenByMigid = async (req, res) => {
  try {
    const migid = req.headers['x-mig-id']; 
    const requestId = req.headers['x-request-id'];

    if (!migid) {
      return res.status(400).json({ error: "X-Mig-ID header is required" });
    }

    if (!requestId) {
      return res.status(400).json({ error: "X-Request-ID header is required" });
    }

    // Ensure requestId is a valid ObjectId
    const resourceObjectId = mongoose.Types.ObjectId.isValid(requestId) ? new mongoose.Types.ObjectId(requestId) : null;
    if (!resourceObjectId) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    console.log("@#@#", migid, requestId)

    // 1. Check Machine Allotment Validity
    const now = new Date();
    const allotment = await MachineAllotment.findOne({
      resourceRequestId: resourceObjectId,
      status: "active",
      startTime: { $lte: now }, // Start time is less than or equal to now
      endTime: { $gte: now }    // End time is greater than or equal to now
    }).lean();

    if (!allotment) {
      console.log("no active allotemtns")
      return res.status(403).json({ 
        error: "No active allotment found for this request at the current time." 
      });
    }

    // 2. Fetch Machine details
    const machine = await Machine.findOne(
      { MIGID: migid },
      { user: 1, ip: 1, _id: 0 },
    ).lean();

    if (!machine) {
      return res.status(404).json({ error: "Machine not found for MIGID" });
    }

    const { user, ip } = machine;

    if (!user || !ip) {
      return res.status(404).json({ error: "User or IP details missing for machine" });
    }

    // 3. Fetch Token from external service
    const url = `http://${ip}:${process.env.TOKEN_SERVER_PORT}/token/${encodeURIComponent(user)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        user: user,
        "x-api-key": process.env.X_API_KEY
      },
    });
    if (!response.ok) {
      throw new Error(`External API failed with status: ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error("Token fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};