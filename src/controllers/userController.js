const Joi = require('joi');
const db = require('../db');
const bcrypt = require('bcrypt');

const validateCreateUserPayload = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    username: Joi.string().trim().min(5).max(20).required(),
    password: Joi.string().trim().min(5).max(100).required(),
    email: Joi.string().trim().max(100).email(),
    contact: Joi.string().trim().length(9),
    userRoleId: Joi.string().trim().max(10).required(),
    branchId: Joi.string().trim().max(10).required(),
  }).validate(payload);
};

const validatePassword = (type, payload) => {
  if (type === 'user') {
    return Joi.object({
      oldPassword: Joi.string().trim().min(5).max(100).required(),
      password: Joi.string().trim().min(5).max(100).required(),
    }).validate(payload);
  } else if (type === 'admin') {
    return Joi.object({
      password: Joi.string().trim().min(5).max(100).required(),
    }).validate(payload);
  }
};

// Get all Users
const getAllUsers = async (req, res) => {
  const results = await db.query(
    'SELECT usr_id, usr_name, usr_username, usr_email, usr_contact, usr_isactive, usrr_id, bnc_id FROM tblusers'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.usr_id,
        name: row.usr_name,
        username: row.usr_username,
        email: row.usr_email,
        contact: row.usr_contact,
        isActive: row.usr_isactive,
        userRoleId: row.usrr_id,
        branchId: row.bnc_id,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(200).json({ message: 'No Data Available' });
  }
};

// Get User by Id
const getUserbyId = async (req, res) => {
  const results = await db.query(
    'SELECT usr_id, usr_name, usr_username, usr_email, usr_contact, usr_isactive, usrr_id, bnc_id FROM tblusers WHERE usr_id=$1',
    [req.user.id]
  );

  const data = results.rows.map((row) => {
    return {
      id: row.usr_id,
      name: row.usr_name,
      email: row.usr_email,
      username: row.usr_username,
      contact: row.usr_contact,
      isActive: row.usr_isactive,
      userRoleId: row.usrr_id,
      branchId: row.bnc_id,
    };
  });
  res.status(200).json(data[0]);
};

// Create User
const createUser = async (req, res) => {
  const emailCheck = false;
  const { error, value } = validateCreateUserPayload(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name, username, password, email, contact, userRoleId, branchId } = value;

  const userResults = await db.query('SELECT usr_username FROM tblusers WHERE usr_username=$1', [
    username,
  ]);

  if (userResults.rowCount > 0) {
    return res.status(400).json({ message: 'User already exist.' });
  }

  if (emailCheck) {
    const emailResults = await db.query('SELECT usr_email FROM tblusers WHERE usr_email=$1', [
      email,
    ]);
    if (emailResults.rowCount > 0) {
      return res.status(400).json({ message: 'User already exist.' });
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const results = await db.query(
    'INSERT INTO tblusers(usr_name, usr_username, usr_password, usr_email, usr_contact, usrr_id, bnc_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [name, username, hashedPassword, email, contact, userRoleId, branchId]
  );

  if (results.rowCount > 0) {
    return res.status(201).json({ message: 'User created successfully.' });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  const { id } = req.user;
  const { name, email, contact } = req.body;

  const results = await db.query(
    'UPDATE tblusers SET usr_name=$2, usr_email=$3, usr_contact=$4 WHERE usr_id=$1 RETURNING *',
    [id, name, email, contact]
  );

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'User updated successfully.' });
  }
};

// Update User Profile by Admin
const updateUserbyAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, contact, userTypeId, branchId, isActive } = req.body;

  const userResults = await db.query('SELECT usr_id FROM tblusers WHERE usr_id=$1', [id]);
  if (userResults.rowCount === 0) {
    return res.status(404).json({ message: 'User does not exist.' });
  }

  const results = await db.query(
    'UPDATE tblusers SET usr_name=$2, usr_email=$3, usr_contact=$4, ust_id=$5, bnc_id=$6, usr_isactive=$7 WHERE usr_id=$1 RETURNING *',
    [id, name, email, contact, userTypeId, branchId, isActive]
  );

  res.status(200).json(results.rows[0]);
};

const updatePasswordbyUser = async (req, res) => {
  const { id } = req.user;
  const { error, value } = validatePassword('user', req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { password, oldPassword } = value;

  const userResults = await db.query('SELECT usr_id, usr_password FROM tblusers WHERE usr_id=$1', [
    id,
  ]);

  const isValidPassword = await bcrypt.compare(oldPassword, userResults.rows[0].usr_password);
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Invalid password.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const results = await db.query(
    'UPDATE tblusers SET usr_password=$2 WHERE usr_id=$1 RETURNING *',
    [id, hashedPassword]
  );

  if (results.rowCount > 0)
    return res.status(200).json({ message: 'Password updated successfully.' });
};

const updatePasswordbyAdmin = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validatePassword('admin', req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { password } = value;

  const userResults = await db.query('SELECT usr_id FROM tblusers WHERE usr_id=$1', [id]);
  if (userResults.rowCount === 0) {
    return res.status(404).json({ message: 'User does not exist.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const results = await db.query(
    'UPDATE tblusers SET usr_password=$2 WHERE usr_id=$1 RETURNING *',
    [id, hashedPassword]
  );

  if (results.rowCount > 0)
    return res.status(200).json({ message: 'Password updated successfully.' });
};

// Delete User
const deleteUserbyId = async (req, res) => {
  const { id } = req.params;

  const userResults = await db.query('SELECT usr_id FROM tblusers WHERE usr_id=$1', [id]);

  if (!userResults.rowCount > 0) {
    return res.status(404).json({ message: 'User does not exist.' });
  }

  await db.query('DELETE FROM tblusers WHERE usr_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllUsers,
  getUserbyId,
  createUser,
  updateUserbyAdmin,
  updateProfile,
  updatePasswordbyUser,
  updatePasswordbyAdmin,
  deleteUserbyId,
};
