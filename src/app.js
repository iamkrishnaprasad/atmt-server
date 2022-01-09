require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const corsOptions = {
  // origin: isProduction ? 'https://www.example.com' : '*',
  origin: '*',
};

// exprss
const app = express();

// disable express header
// app.disable('X-Powered-By');

// 3rd Party Middleware
app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(cors(corsOptions));

// Custom Middleware
const errorHandler = require('./middleware/error');

// require('./utils/logger-morgan')(app);
// require('./utils/logger-winston');

if (!process.env.JWT_PRIVATE_KEY) {
  throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
}

app.get('/api/', (req, res) => {
  res.send('ATMT WEBAPI');
});

app.use('/api/v1/', require('./routes/index'));

app.all('*', (req, res, next) => {
  // throw new AppError(404, "Route Not Found");
  // err.statusCode = 404;
  res.status(404).json({ message: 'Route Not Found' });
});

app.use(function (err, req, res, next) {
  // console.log('500: ', err);
  // logger.error(err);
  // res.status(500).json({ message: 'Something went wrong.' });
  res.status(500).json({ message: err.message });
});

module.exports = app;
