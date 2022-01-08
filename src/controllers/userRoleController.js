const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    role: Joi.string().trim().min(3).max(20).required(),
  }).validate(payload);
};

const getAllUserRoles = async (req, res) => {
  const results = await db.query(
    'SELECT usrr_id, usrr_role FROM tbluserroles WHERE usrr_isvisible=true ORDER BY usrr_id'
  );
  const data = results.rows.map((row) => {
    return {
      id: row.usrr_id,
      role: row.usrr_role,
    };
  });
  res.status(200).json(data);
};

const createUserRole = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { role } = value;

  const userRoleResults = await db.query('SELECT usrr_role FROM tbluserroles WHERE usrr_role=$1', [
    role,
  ]);
  if (userRoleResults.rowCount > 0) {
    return res.status(400).json({ message: 'User role already exist.' });
  }

  const results = await db.query('INSERT INTO tbluserroles(usrr_role) VALUES ($1)', [role]);
  if (results.rowCount > 0) {
    return res.status(201).json({ message: 'User role created successfully.' });
  }
};

const updateUserRolebyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { role } = value;

  const userRoleResults = await db.query('SELECT usrr_id FROM tbluserroles WHERE usrr_id=$1', [id]);
  if (userRoleResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tbluserroles SET usrr_role=$2 WHERE usrr_id=$1 RETURNING *',
    [id, role]
  );
  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'User updated successfully.' });
  }
};

const deleteUserRolebyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT usrr_id FROM tbluserroles WHERE usrr_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'User role does not exist.' });
  }

  await db.query('DELETE FROM tbluserroles WHERE usrr_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = { getAllUserRoles, createUserRole, updateUserRolebyId, deleteUserRolebyId };
