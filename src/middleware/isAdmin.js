const db = require('../db');

module.exports = async function (req, res, next) {
  const results = await db.query(
    `SELECT tbluserroles.usrr_role FROM tblusers INNER JOIN tbluserroles ON tbluserroles.usrr_id=tblusers.usrr_id WHERE usr_id=$1 AND tbluserroles.usrr_role = 'Admin'`,
    [req.user.id]
  );
  if (!results.rowCount > 0)
    return res.status(403).json({
      message: 'Access denied.',
    });
  next();
};
