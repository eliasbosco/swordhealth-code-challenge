const express = require('express');
const router = express.Router();

const task = require('../controllers/task');
const sessionHandler = require('../middleware/sessionHandler');

router.get('/tasks', sessionHandler, task.findAll);
router.get('/task/:id', sessionHandler, task.findOneById);
router.post('/task', sessionHandler, task.create);
router.put('/task/:id', sessionHandler, task.update);
router.delete('/task/:id', sessionHandler, task.deleteTask);

module.exports = router;