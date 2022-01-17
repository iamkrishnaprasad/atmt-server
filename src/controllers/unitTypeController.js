const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
  }).validate(payload);
};

const getAllUnitTypes = async (req, res) => {
  const results = await db.query('SELECT unty_id, unty_name FROM tblunittypes ORDER BY unty_id');

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.unty_id,
        name: row.unty_name,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createUnitType = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const paymentTermResults = await db.query('SELECT unty_name FROM tblunittypes WHERE unty_name=$1', [name]);
  if (paymentTermResults.rowCount === 1) {
    return res.status(400).json({ message: 'Unit type already exist.' });
  }

  const results = await db.query('INSERT INTO tblunittypes(unty_name) VALUES ($1)', [name]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Unit type created successfully.' });
  }
};

const updateUnitTypebyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const paymentTermResults = await db.query('SELECT unty_id FROM tblunittypes WHERE unty_id=$1', [id]);
  if (paymentTermResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query('UPDATE tblunittypes SET unty_name=$2 WHERE unty_id=$1 RETURNING *', [id, name]);

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'Unit type updated successfully.' });
  }
};

const deleteUnitTypebyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT unty_id FROM tblunittypes WHERE unty_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Unit type does not exist.' });
  }

  await db.query('DELETE FROM tblunittypes WHERE unty_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllUnitTypes,
  createUnitType,
  updateUnitTypebyId,
  deleteUnitTypebyId,
};
