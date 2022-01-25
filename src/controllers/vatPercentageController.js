const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    vatPercentage: Joi.number().min(1).max(99).required(),
  }).validate(payload);
};

const getAllVATPercentages = async (req, res) => {
  const results = await db.query('SELECT vatp_id, vatp_value FROM tblvatpercentage ORDER BY vatp_value');

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.vatp_id,
        vatPercentage: row.vatp_value,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createVATPercentage = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { vatPercentage } = value;

  const vatResults = await db.query('SELECT vatp_value FROM tblvatpercentage WHERE vatp_value=$1', [vatPercentage]);
  if (vatResults.rowCount === 1) {
    return res.status(400).json({ message: 'VAT Percentage already exist.' });
  }

  const results = await db.query('INSERT INTO tblvatpercentage(vatp_value) VALUES ($1)', [vatPercentage]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'VAT Percentage created successfully.' });
  }
};

const updateVATPercentagebyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { vatPercentage } = value;

  const vatResults = await db.query('SELECT vatp_id FROM tblvatpercentage WHERE vatp_id=$1', [id]);
  if (vatResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query('UPDATE tblvatpercentage SET vatp_value=$2 WHERE vatp_id=$1 RETURNING *', [id, vatPercentage]);
  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'VAT Percentage updated successfully.' });
  }
};

const deleteVATPercentagebyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT vatp_id FROM tblvatpercentage WHERE vatp_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'VATPercentage does not exist.' });
  }

  await db.query('DELETE FROM tblvatpercentage WHERE vatp_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = { getAllVATPercentages, createVATPercentage, updateVATPercentagebyId, deleteVATPercentagebyId };
