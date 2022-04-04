const LoggerService = require('../helpers/loggerService');
const cryptoHelper = require('../helpers/cryptoHelper');
const { User } = require('../models/index');

exports.login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (emailAddress === '' || password === '') {
      throw new Error('Unauthorized');
    }

    const user = await User.findOne({
      where: {
        emailAddress,
      }
    });
    if (user.password !== cryptoHelper.getSHA256(process.env.SESSION_SECRET + password)) {
      throw new Error('Unauthorized');
    }
    req.session.user = {
      id: user.id,
      emailAddress: user.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    LoggerService.createLogObject({
      statusCode: 200,
      message: 'Logged successfully',
      error: false,
    }).log();

    res.status(200).send({ message: 'Logged successfully', data: req.session.user });
  } catch (e) {

    LoggerService.createLogObject({
      statusCode: 401,
      message: e.message,
      error: true,
    }).log();

    res.status(401).send({ message: e.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await req.session.destroy(err => {
      if (err){
        throw err;
      }
    });
    res.clearCookie('session_token');

    res.status(200).send({ message: 'Logout successfully' });
  } catch (e) {
    LoggerService.createLogObject({
      statusCode: 500,
      message: e.message,
      error: true,
    }).log();

    res.status(500).send({ message: e.message });
  }
};

exports.isLogged = async (req, res) => {
  try {
    LoggerService.createLogObject({
      statusCode: 200,
      message: `User '${req.session.user.emailAddress}' is already logged`,
      error: false,
    }).log();

    res.status(200).send({ data: req.session.user });
  } catch (e) {

    LoggerService.createLogObject({
      statusCode: 401,
      message: e.message,
      error: true,
    }).log();

    res.status(401).send({ message: e.message });
  }
};