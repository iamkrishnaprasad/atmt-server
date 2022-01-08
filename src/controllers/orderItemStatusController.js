const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
  }).validate(payload);
};

const getAllOrderItemStatuses = async (req, res) => {
  const results = await db.query(
    'SELECT ordis_id, ordis_name FROM tblorderitemstatus ORDER BY ordis_id'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.ordis_id,
        name: row.ordis_name,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createOrderitemStatus = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const orderitemstatusResults = await db.query(
    'SELECT ordis_name FROM tblorderitemstatus WHERE ordis_name=$1',
    [name]
  );
  if (orderitemstatusResults.rowCount === 1) {
    return res.status(400).json({ message: 'Order item status already exist.' });
  }

  const results = await db.query('INSERT INTO tblorderitemstatus(ordis_name) VALUES ($1)', [name]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Order item status created successfully.' });
  }
};

const updateOrderItemStatusbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;
  const orderitemstatusResults = await db.query(
    'SELECT ordis_id FROM tblorderitemstatus WHERE ordis_id=$1',
    [id]
  );
  if (orderitemstatusResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblorderitemstatus SET ordis_name=$2 WHERE ordis_id=$1 RETURNING *',
    [id, name]
  );

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'Order item status updated successfully.' });
  }
};

const deleteOrderItemStatusbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT ordis_id FROM tblorderitemstatus WHERE ordis_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Order item status does not exist.' });
  }

  await db.query('DELETE FROM tblorderitemstatus WHERE ordis_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllOrderItemStatuses,
  createOrderitemStatus,
  updateOrderItemStatusbyId,
  deleteOrderItemStatusbyId,
};
