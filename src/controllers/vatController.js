const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    vat: Joi.number().min(1).max(100).required(),
  }).validate(payload);
};

const getAllVATs = async (req, res) => {
  const results = await db.query(
    'SELECT vat_id, vat_percentage FROM tblvat ORDER BY vat_percentage'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.vat_id,
        percentage: row.vat_percentage,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createVAT = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { vat } = value;

  const vatResults = await db.query('SELECT vat_percentage FROM tblvat WHERE vat_percentage=$1', [
    vat,
  ]);
  if (vatResults.rowCount === 1) {
    return res.status(400).json({ message: 'VAT already exist.' });
  }

  const results = await db.query('INSERT INTO tblvat(vat_percentage) VALUES ($1)', [vat]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'VAT created successfully.' });
  }
};

const updateVATbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { vat } = value;

  const vatResults = await db.query('SELECT vat_id FROM tblvat WHERE vat_id=$1', [id]);
  if (vatResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblvat SET vat_percentage=$2 WHERE vat_id=$1 RETURNING *',
    [id, vat]
  );
  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'VAT updated successfully.' });
  }
};

const deleteVATbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT vat_id FROM tblvat WHERE vat_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'VAT does not exist.' });
  }

  await db.query('DELETE FROM tblvat WHERE vat_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = { getAllVATs, createVAT, updateVATbyId, deleteVATbyId };
