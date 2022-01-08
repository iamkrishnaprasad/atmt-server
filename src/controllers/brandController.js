const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
  }).validate(payload);
};

const getAllBrands = async (req, res) => {
  const results = await db.query('SELECT bnd_id, bnd_name FROM tblbrands ORDER BY bnd_name');

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.bnd_id,
        name: row.bnd_name,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createBrand = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const brandResults = await db.query('SELECT bnd_name FROM tblbrands WHERE bnd_name=$1', [name]);
  if (brandResults.rowCount === 1) {
    return res.status(400).json({ message: 'Brand already exist.' });
  }

  const results = await db.query('INSERT INTO tblbrands(bnd_name) VALUES ($1)', [name]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Brand created successfully.' });
  }
};

const updateBrandbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;
  const brandResults = await db.query('SELECT bnd_id FROM tblbrands WHERE bnd_id=$1', [id]);
  if (brandResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query('UPDATE tblbrands SET bnd_name=$2 WHERE bnd_id=$1 RETURNING *', [
    id,
    name,
  ]);

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'Brand updated successfully.' });
  }
};

const deleteBrandbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT bnd_id FROM tblbrands WHERE bnd_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Brand does not exist.' });
  }

  await db.query('DELETE FROM tblbrands WHERE bnd_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = { getAllBrands, createBrand, updateBrandbyId, deleteBrandbyId };
