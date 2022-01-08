const app = require('./src/app');
// const logger = require('./src/utils/logger-winston');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
