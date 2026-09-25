const express = require('express');
const router = express.Router();
const { getDLQ, retryEvent, getMetrics } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/dlq', protect, rbac('ADMIN'), getDLQ);
router.post('/retry/:eventId', protect, rbac('ADMIN'), retryEvent);
router.get('/metrics', protect, getMetrics);

module.exports = router;
