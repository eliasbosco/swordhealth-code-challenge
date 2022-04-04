const uri = '/api/v1';

module.exports = (app) => {
  app.use(uri + '/auth',  require('./auth'));
  app.use(uri + '/user', require('./user'));
  app.use(uri + '/task', require('./task'));
};
