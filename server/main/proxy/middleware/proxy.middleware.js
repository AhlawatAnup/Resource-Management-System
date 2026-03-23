const { getActiveAllotment } = require('../db/proxy.service');

exports.requireProxyTarget = async (req, res, next) => {
	if (!req.session?.proxyTarget) {
        return res.redirect("/home");
	}
	next();
};

exports.checkActiveAllotment = async (req, res, next) => {
    try {
        const requestId = req.session.requestId;

        if (!requestId) {
            return res.status(400).json({ message: 'No requestId in session' });
        }

        const allotment = await getActiveAllotment(requestId);

        if (!allotment) {
            return res.status(403).json({
                message: 'Access denied: No active allotment at this time'
            });
        }

        next();
    } catch (err) {
        console.error('Error in allotment middleware:', err);
        res.status(500).json({ message: 'Server error in allotment check' });
    }
};