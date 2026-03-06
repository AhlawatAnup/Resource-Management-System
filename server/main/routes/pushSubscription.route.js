const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { savePushSubscription } = require('../controllers/pushSubscription.controller');

// Save web-push subscription
router.post('/subscribe', requireAuth, savePushSubscription);

module.exports = router;
