const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
  }).validate(payload);
};

const getAllPaymentTerms = async (req, res) => {
  const results = await db.query('SELECT pyt_id, pyt_name FROM tblpaymentterms ORDER BY pyt_id');

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.pyt_id,
        name: row.pyt_name,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createPaymentTerm = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const paymentTermResults = await db.query(
    'SELECT pyt_name FROM tblpaymentterms WHERE pyt_name=$1',
    [name]
  );
  if (paymentTermResults.rowCount === 1) {
    return res.status(400).json({ message: 'Payment term already exist.' });
  }

  const results = await db.query('INSERT INTO tblpaymentterms(pyt_name) VALUES ($1)', [name]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Payment term created successfully.' });
  }
};

const updatePaymentTermbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const paymentTermResults = await db.query('SELECT pyt_id FROM tblpaymentterms WHERE pyt_id=$1', [
    id,
  ]);
  if (paymentTermResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblpaymentterms SET pyt_name=$2 WHERE pyt_id=$1 RETURNING *',
    [id, name]
  );

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'Payment term updated successfully.' });
  }
};

const deletePaymentTermbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT pyt_id FROM tblpaymentterms WHERE pyt_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Payment term does not exist.' });
  }

  await db.query('DELETE FROM tblpaymentterms WHERE pyt_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllPaymentTerms,
  createPaymentTerm,
  updatePaymentTermbyId,
  deletePaymentTermbyId,
};
