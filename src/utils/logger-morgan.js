const moment = require('moment-timezone');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
  const dateTime = moment().tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS');
  const logDirName = 'logs';
  const logFileName = `req-errors-${dateTime.split('T')[0]}.log`;

  if (!fs.existsSync(logDirName)) {
    fs.mkdir(path.join(path.resolve('./'), logDirName), (err) => {
      if (err) {
        return console.log(err);
      }
    });
  }

  const logStream = fs.createWriteStream(path.join(path.resolve('./'), logDirName, logFileName), {
    flags: 'a',
  });

  const originalSend = app.response.send;
  app.response.send = function (data) {
    originalSend.call(this, data);
    this.__body = data;
  };

  morgan.token('json', (req, res) => {
    return JSON.stringify({
      req: {
        dateTime: `${dateTime}Z`,
        httpVersion: req.httpVersion,
        headers: req.headers,
        method: req.method,
        url: req.originalUrl,
        ip: req._remoteAddress,
        body: req.body,
      },
      res: {
        statusCode: res.statusCode,
        'response-time':
          parseInt(moment(res._startTime).valueOf() - moment(req._startTime).valueOf()) + ' ms',
        'content-length': res._contentLength,
        body: JSON.parse(res.__body),
      },
    });
  });

  app.use(
    morgan(':json', {
      skip: function (req, res) {
        return res.statusCode < 400;
      },
      stream: logStream,
    })
  );
};
