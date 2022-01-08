const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
  }).validate(payload);
};

const getAllCategories = async (req, res) => {
  const results = await db.query('SELECT cat_id, cat_name FROM tblcategories ORDER BY cat_name');

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.cat_id,
        name: row.cat_name,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createCategory = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;

  const categoriesResults = await db.query('SELECT cat_name FROM tblcategories WHERE cat_name=$1', [
    name,
  ]);
  if (categoriesResults.rowCount === 1) {
    return res.status(400).json({ message: 'Product category already exist.' });
  }

  const results = await db.query('INSERT INTO tblcategories(cat_name) VALUES ($1)', [name]);
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Product category created successfully.' });
  }
};

const updateCategorybyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name } = value;
  const categoriesResults = await db.query('SELECT cat_id FROM tblcategories WHERE cat_id=$1', [
    id,
  ]);
  if (categoriesResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblcategories SET cat_name=$2 WHERE cat_id=$1 RETURNING *',
    [id, name]
  );

  if (results.rowCount > 0) {
    return res.status(200).json({ message: 'Product category updated successfully.' });
  }
};

const deleteCategorybyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT cat_id FROM tblcategories WHERE cat_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Product category does not exist.' });
  }

  await db.query('DELETE FROM tblcategories WHERE cat_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = { getAllCategories, createCategory, updateCategorybyId, deleteCategorybyId };
