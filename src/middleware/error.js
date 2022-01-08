// const logger = require('../utils/logger-winston');

module.exports = function (err, _req, res, _next) {
  console.log(err);
  // logger.error(err);
  res.status(500).json({ message: 'Something went wrong.' });
};

// require('dotenv').config();

// const developmentError = (err, res) => {
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     message: err.message,
//     stack: err.stack,
//   });
// };

// const productionError = (err, res) => {
//   const statusCode = err.statusCode || 500;
//   if (err.isOperational) {
//     res.status(statusCode).json({
//       message: err.message,
//     });
//   } else {
//     res.status(statusCode).json({
//       message: 'Something went wrong.',
//     });
//   }
// };

// const isProduction = process.env.NODE_ENV === 'production';
// module.exports = (err, req, res, next) => {
//   if (isProduction) {
//     productionError(err, res);
//   } else {
//     developmentError(err, res);
//   }
// };
