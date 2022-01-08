const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
  }).validate(payload);
};

const getAllOrderStatuses = async (req, res) => {
  const results = await db.query('SELECT ords_id, ords_name FROM tblorderstatus ORDER BY ords_id');

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.ords_id,
        name: row.ords_name,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createOrderStatus = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const orderstatusResults = await db.query(
    'SELECT ords_name FROM tblorderstatus WHERE ords_name=$1',
    [name]
  );
  if (orderstatusResults.rowCount === 1) {
    return res.status(400).json({ message: 'Order status already exist.' });
  }

  const results = await db.query('INSERT INTO tblorderstatus(ords_name) VALUES ($1)', [name]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Order status created successfully.' });
  }
};

const updateOrderStatusbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;
  const orderstatusResults = await db.query('SELECT ords_id FROM tblorderstatus WHERE ords_id=$1', [
    id,
  ]);
  if (orderstatusResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblorderstatus SET ords_name=$2 WHERE ords_id=$1 RETURNING ords_id',
    [id, name]
  );

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'Order status updated successfully.' });
  }
};

const deleteOrderStatusbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT ords_id FROM tblorderstatus WHERE ords_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Order status does not exist.' });
  }

  await db.query('DELETE FROM tblorderstatus WHERE ords_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllOrderStatuses,
  createOrderStatus,
  updateOrderStatusbyId,
  deleteOrderStatusbyId,
};
