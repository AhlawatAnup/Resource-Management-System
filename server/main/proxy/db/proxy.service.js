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
      { user: 1, _id: 0 },
    ).lean();

    if (!machine) {
      return res.status(404).json({ error: "Machine not found for MIGID" });
    }

    const user = machine.user;

    if (!user) {
      return res.status(404).json({ error: "user not found for machine" });
    }

    const response = await fetch(
      `${process.env.API_URL}/token/${encodeURIComponent(user)}`,
      {
        method: "GET",
        headers: {
          user: user,
          "x-api-key": process.env.X_API_KEY,
        },
      }
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