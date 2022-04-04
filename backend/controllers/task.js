const LoggerService = require('../helpers/loggerService');
const { Task } = require('../models/index');

findAll = async (req, res) => {
  try {
    const where = req.session.user.role > 0 ?
      {
        userId: req.session.user.id,
      } :
      {};
    const data = await Task.findAll({
      where,
      order: [['id', 'DESC']],
    });
    res.status(200).send({ data });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();
    res.status(500).send({ message: e.message });
  }
};

getWhereConsideringRole = (req, id) => {
  return req.session.user.role === 0 ?
      {
        id,
      } :
      {
        userId: req.session.user.id,
        id,
      };
};

findOneById = async (req, res) => {
  try {
    const { id } = req.params;
    const where = getWhereConsideringRole(req, id);
    const data = await Task.findOne({
      where,
    });
    res.status(200).send({ data });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();
    res.status(500).send({ message: e.message });
  }
};

create = async (req, res) => {
  try {
    const taskBody = req.body;
    taskBody.userId = req.session.user.id;
    taskBody.date = new Date(Date.parse(taskBody.date));
    const task = await Task.create(taskBody);

    // pub notification
    const taskSumm = taskBody.summary.length > 100 ?
      taskBody.summary.substring(0, 100) + '...' :
      taskBody.summary;
    const msg = `The tech '${req.session.user.firstName} ${req.session.user.lastName}' performed the task: 
      '${taskSumm}' on date ${taskBody.date.toString().split(' GMT')[0]}`;

    global.natsCon.publish("task", global.stringCodec.encode(msg));
    global.natsCon.flush();

    res.status(200).send({ message: `Task added successfully`, data: task });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();
    res.status(500).send({ message: e.message });
  }
};

update = async (req, res) => {
  try {
    const { id } = req.params;
    const taskBody = req.body;
    const date = new Date(Date.parse(taskBody.date));

    const count = await Task.update(
        { summary: taskBody.summary, date },
        { where: getWhereConsideringRole(req, id) },
    );

    if (count[0] === 0) {
      const message = `Task #${id} can't be changed`;
      LoggerService.createLogObject({
        statusCode: 403,
        message,
        error: true,
      }).log();
      res.status(403).send({ message });
    }

    // pub notification
    const taskSumm = taskBody.summary.length > 100 ?
        taskBody.summary.substring(0, 100) + '...' :
        taskBody.summary;
    const msg = `The tech '${req.session.user.firstName} ${req.session.user.lastName}' has changed the task: 
      '${taskSumm}' on date ${date.toString().split(' GMT')[0]}`;

    global.natsCon.publish("task", global.stringCodec.encode(msg));
    global.natsCon.flush();

    res.status(200).send({ message: `Task changed successfully`, data: taskBody });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();
    res.status(500).send({ message: e.message });
  }
};

deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.session.user.role !== 0) {
      const message = `Task #${id} can't be removed`;
      LoggerService.createLogObject({
        statusCode: 403,
        message,
        error: true,
      }).log();
      res.status(403).send({ message });
    }

    const count = await Task.destroy({ where: getWhereConsideringRole(req, id) });
    res.status(200).send({ message: `deleted row(s): ${count}` });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();
    res.status(500).send({ message: e.message });
  }
};

module.exports = {
  findAll,
  findOneById,
  create,
  deleteTask,
  update,
};