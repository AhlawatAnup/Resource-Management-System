const express = require("express");
const { proxyMiddleware } = require("../controllers/proxyMachine.controller.js");
const { setSession } = require('../controllers/proxyMachine.controller.js');
const { requireProxyTarget } = require("../middleware/proxy.middleware.js");
const { getTokenByMigid } = require("../db/proxy.service.js");

const router = express.Router();

router.post('/proxy/set-session', setSession);
router.get("/proxy/token/:migid", getTokenByMigid);

router.use('/', requireProxyTarget, proxyMiddleware);

module.exports = router;
