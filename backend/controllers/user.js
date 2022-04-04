const LoggerService = require('../helpers/loggerService');
const { User } = require('../models/index');

exports.findAll = async (req, res) => {
  try {
    const where = req.session.user.role > 0 ?
      {
        emailAddress: req.session.user.emailAddress,
      } :
      {};
    const user = await User.findAll({
      attributes: ['firstName', 'lastName', 'role'],
      where,
      order: [
        ['firstName', 'ASC'],
        ['lastName', 'ASC'],
      ],
    });
    res.status(200).send({ data: user });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();
    res.status(500).send({ message: e.message });
  }
};