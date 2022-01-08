module.exports = function (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// const use = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// module.exports = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next);
//   };
// };
