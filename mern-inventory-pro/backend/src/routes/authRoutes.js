const express = require('express');
const router = express.Router();
const { loginUser, registerUser, msalLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/msal', msalLogin);
router.get('/me', protect, getMe);

module.exports = router;
