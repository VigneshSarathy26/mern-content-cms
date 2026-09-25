const express = require('express');
const router = express.Router();
const { getAttachments, uploadAttachment } = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAttachments);
router.post('/', protect, uploadAttachment);

module.exports = router;
