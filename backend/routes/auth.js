const express = require('express');
const router = express.Router();

const sessionHandler = require('../middleware/sessionHandler');
const auth = require('../controllers/auth');

router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/is-logged', sessionHandler, auth.isLogged);

module.exports = router;