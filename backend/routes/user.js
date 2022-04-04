const express = require('express');
const router = express.Router();

const user = require('../controllers/user');
const sessionHandler = require('../middleware/sessionHandler');

router.get('/users', sessionHandler, user.findAll);

module.exports = router;