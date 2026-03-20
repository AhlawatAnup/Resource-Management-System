const { getMachineByMigid } = require('../utils/proxy.utils'); // adjust path

exports.setSession = async (req, res) => {
    try {
        console.log("request reqcived for setSession")
        const { migid } = req.body;
        if (!migid) return res.status(400).json({ message: 'migid is required' });

        const machine = await getMachineByMigid(migid);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });

        // Save machine info in session
        req.session.migid = migid;
        req.session.proxyTarget = `http://${machine.ip}:${machine.port}`;
        req.session.ip = machine.ip;
        req.session.port = machine.port;

        req.session.save((err) => {
            if (err) return res.status(500).json({ message: 'Failed to save session' });
            res.json({ message: 'Session set successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};