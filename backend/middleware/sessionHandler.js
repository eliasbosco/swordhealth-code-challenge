const { Session, User } = require('../models/index');
const LoggerService = require('../helpers/loggerService');

module.exports = async (req, res, next) => {
  // Attempt to attach an email address to a request cycle using the user object in a session
  if (req.session?.user) {
    try {
      const user = await User.findOne({
        where: {
          emailAddress: req.session.user.emailAddress,
        }
      });
      if (user) {
        next();
        return;
      }
    } catch (e) {
      LoggerService.createLogObject(`ERROR SESSION HANDLER`, 'error', error).log();
      res.status(401).send({ message: e.message });
    }
  }

  // Attempt to attach an email address to a request cycle using Session ID
  try {
    const sid = req.sessionID;
    LoggerService.createLogObject(
      `Attempting to reauthenticate with Session ID ${sid}`,
      'info'
    ).log();
    const reauthenticatedSession = await Session.findOne({
      where: { sid },
      attributes: ['sess'],
      raw: true,
    });
    if (reauthenticatedSession) {
      const emailAddress = reauthenticatedSession.sess?.user?.email;
      LoggerService.createLogObject(
        `Reauthenticate successful using session ID in database ${sid}`,
        'info'
      ).log();
      if (emailAddress) {
        const user = await User.findOne({
          where: {
            emailAddress: req.session.user.emailAddress,
          }
        });
        if (user) {
          req.session.user = {
            id: user.id,
            emailAddress: user.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          };
          next();
          return;
        }
      }
    }

    LoggerService.createLogObject(
      `Reauthenticate unsuccessful using session ID in database ${sid}`,
      'info'
    ).log();

    throw new Error(`Reauthenticate unsuccessful`);
  } catch (e) {
    LoggerService.createLogObject(`ERROR SESSION HANDLER`, 'error', e).log();
    res.status(401).send({ message: e.message });
  }
};
