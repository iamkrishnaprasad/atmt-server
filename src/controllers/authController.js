const Joi = require('joi');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function validate(payload) {
  return Joi.object({
    username: Joi.string().trim().min(5).max(20).required(),
    password: Joi.string().trim().min(5).max(100).required(),
  }).validate(payload);
}

const login = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { username, password } = value;

  const userResults = await db.query(
    'SELECT usr_id, usr_username, usr_password, usr_isactive, bnc_id FROM tblusers WHERE usr_username=$1',
    [username]
  );
  if (!userResults.rowCount > 0)
    return res.status(400).json({ message: 'Invalid username or password.' });

  if (!userResults.rows[0].usr_isactive)
    return res.status(403).json({ message: 'Access denied. Account has been deactivated.' });

  const isValidPassword = await bcrypt.compare(password, userResults.rows[0].usr_password);
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Invalid username or password.' });
  }

  const token = jwt.sign({ id: userResults.rows[0].usr_id }, process.env.JWT_PRIVATE_KEY);
  res.header('x-auth-token', token).json({ message: 'User login successfully.' });
};

module.exports = { login };
