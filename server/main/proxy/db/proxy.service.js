const Machine = require('../../database/machineModel');

exports.getMachineByMigid = async (migid) => {
    const machine = await Machine.findOne({ MIGID: migid }).lean(); // lean() returns plain JS object
    if (!machine) {
        throw new Error("Machine not found for MIGID: " + migid);
    }
    return machine;
};

exports.getTokenByMigid = async (req, res) => {
  try {
    const { migid } = req.params;

    if (!migid) {
      return res.status(400).json({ error: "MIGID is required" });
    }

    const machine = await Machine.findOne(
      { MIGID: migid },
      { username: 1, _id: 0 }
    ).lean();

    if (!machine) {
      return res.status(404).json({ error: "Machine not found for MIGID" });
    }

    const username = machine.username;

    if (!username) {
      return res.status(404).json({ error: "Username not found for machine" });
    }

    const response = await fetch(
      `http://localhost:5001/token/${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      throw new Error("External API failed");
    }

    const data = await response.json();

    return res.json(data);

  } catch (err) {
    console.error("Token fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch token" });
  }
};