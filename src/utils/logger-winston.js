const moment = require('moment-timezone');
const { createLogger, transports, format } = require('winston');
const { combine, errors, timestamp, json, simple } = format;

const date = moment().tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS');

const logger = createLogger({
  transports: [
    // new transports.Console({
    //   level: 'silly',
    //   format: simple(),
    // }),
    new transports.File({
      filename: `./logs/app-${date.split('T')[0]}.log`,
      level: 'warn',
      format: combine(errors({ stack: true }), timestamp({ format: date }), json()),
      handleRejections: true,
      handleExceptions: true,
    }),
  ],
});

module.exports = logger;
