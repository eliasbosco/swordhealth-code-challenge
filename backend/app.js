const LoggerService = require('./helpers/loggerService');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const compression = require('compression');
const { connect, StringCodec } = require("nats");
const routing = require('./routes/index');

const PORT = process.env.API_PORT || 8080;

// create new express app and save it as "app"
const app = express();

const whitelist = [
    'http://localhost:1234',
    'http://127.0.0.1:1234',
];

const corsOptions = {
  origin(origin, callback) {
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true,
};

global.sessionStore = new mysqlStore({
  pruneSessionInterval: 60,
  tableName: 'session',
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  connectionLimit: process.env.DB_POOL_MAX,
  queueLimit: 10000,
  waitForConnections: true,
});

// to support JSON-encoded bodies
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// to support URL-encoded bodies
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true,
  })
);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(compression());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'session_token',
    rolling: true,
    cookie: {
      httpOnly: false,
      secure: (process.env.NODE_ENV === 'production'),
      maxAge: 1000 * 60 * 60,
      sameSite: true,
    },
    store: global.sessionStore,
  })
);

// Routes
routing(app);

app.listen(PORT, async () => {
  LoggerService.createLogObject(`server is listening on ${PORT}`, 'info').log();
  // to create a connection to a nats-server:
  global.natsCon = await connect({
    servers: `${process.env.NATS_HOST}:${process.env.NATS_PORT}`,
    token: process.env.NATS_TOKEN,
    timeout: process.env.NATS_TIMEOUT,
    noEcho: process.env.NATS_NOECHO,
    maxReconnectAttempts: process.env.NATS_MAXRECONNECTATTEMPTS,
    pingInterval: process.env.NATS_PINGINTERVAL,
    maxPingOut: process.env.NATS_MAXPINGOUT,
  });
// create a codec
  global.stringCodec = StringCodec();
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  LoggerService.createLogObject('SIGTERM signal received: closing HTTP server', 'info').log();
  app.close(() => {
    LoggerService.createLogObject('HTTP server closed', 'info').log();
  });
  global.sessionStore.close();
  LoggerService.createLogObject('Mysql Session store closed', 'info').log();

  await global.natsCon.drain();
  LoggerService.createLogObject('Nats connection closed', 'info').log();
});

module.exports = app;