const db = require('../db');

module.exports = async function (req, res, next) {
  try {
    const results = await db.query('SELECT usr_isactive FROM tblusers WHERE usr_id=$1', [
      req.user.id,
    ]);
    if (results.rowCount !== 1)
      return res.status(400).json({
        message: 'Invalid token.',
      });
    if (!results.rows[0].usr_isactive)
      return res.status(403).json({
        message: 'Access denied. Account has been deactivated.',
      });
    next();
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
