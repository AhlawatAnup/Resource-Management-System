const express = require("express");
const { proxyMiddleware } = require("../controllers/proxyMachine.controller.js");
const { setSession } = require('../controllers/proxyMachine.controller.js');
const { requireProxyTarget } = require("../middleware/proxy.middleware.js");

const router = express.Router();

router.post('/proxy/set-session', setSession);

router.use('/', requireProxyTarget, proxyMiddleware);

module.exports = router;
