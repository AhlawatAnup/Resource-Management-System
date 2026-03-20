const express = require('express');
const router = express.Router();
const { setSession } = require('../controllers/proxy.controller');

// POST /proxy/set-session
router.post('/set-session', setSession);

module.exports = router;