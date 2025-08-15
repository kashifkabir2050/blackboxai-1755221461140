const { Router } = require('express');
const { register, login, getProfile } = require('../controllers/authController');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile);

module.exports = router;
