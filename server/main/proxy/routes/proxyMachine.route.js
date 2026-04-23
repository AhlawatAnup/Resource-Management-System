const express = require('express');
const {
  proxyMiddleware,
  setSession,
  getTokenByMigid,
} = require('../controllers/proxyMachine.controller.js');
const { requireProxyTarget, validateRequest } = require('../middleware/proxy.middleware.js');

const router = express.Router();

router.post('/proxy/set-session', setSession);
router.get('/proxy/token', getTokenByMigid);

router.use('/', requireProxyTarget, validateRequest, proxyMiddleware);

module.exports = router;
