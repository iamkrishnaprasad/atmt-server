const Joi = require('joi');
const db = require('../db');

const branchId = 'BRNCH00001';

const getProducts = async (req, res) => {
  const results = await db.query(
    'SELECT tblproducts.pro_id, pro_name, pro_altname, pro_isactive, vatp_id, bnd_id, cat_id, unty_id, prl_sellingprice, prl_discountprice, COALESCE(quantity,0) AS quantity FROM tblproducts LEFT OUTER JOIN ( SELECT pro_id, prl_sellingprice, prl_discountprice FROM tblpricelists WHERE prl_isdeleted = false AND bnc_id = $1 ) AS pricelists ON pricelists.pro_id = tblproducts.pro_id LEFT OUTER JOIN ( SELECT pro_id, SUM(inv_quantityleft) AS quantity FROM tblinventories INNER JOIN tblpurchaseorders ON tblpurchaseorders.por_id = tblinventories.por_id WHERE inv_isdeleted = false AND bnc_id = $1 GROUP BY pro_id ) AS inventories ON inventories.pro_id = tblproducts.pro_id WHERE pro_isdeleted = false ORDER BY pro_id',
    [branchId]
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.pro_id,
        name: row.pro_name,
        altName: row.pro_altname,
        sellingPrice: parseFloat(row.prl_sellingprice).toFixed(2),
        discountPrice: parseFloat(row.prl_discountprice).toFixed(4),
        stockQty: parseInt(row.quantity),
        isActive: row.pro_isactive,
        vatPercentageId: row.vatp_id,
        brandId: row.bnd_id,
        categoryId: row.cat_id,
        unitTypeId: row.unty_id,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getProductsbySearch = async (req, res) => {
  const { error, value } = Joi.object({
    keyword: Joi.string().trim().min(2).max(15).required(),
    stockCheck: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
  }).validate(req.body);

  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { keyword, stockCheck, isActive } = value;

  const results = await db.query(
    `SELECT tblproducts.pro_id, pro_name, vatp_id, prl_sellingprice, prl_discountprice, COALESCE(quantity,0) AS quantity, netpurchaseprice FROM tblproducts LEFT OUTER JOIN (SELECT pro_id, prl_sellingprice, prl_discountprice FROM tblpricelists WHERE prl_isdeleted = false AND bnc_id = $2) AS pricelists ON pricelists.pro_id = tblproducts.pro_id LEFT OUTER JOIN (SELECT pro_id, SUM(inv_quantityleft) AS quantity, ROUND(AVG(inv_netprice), 4) AS netpurchaseprice FROM tblinventories INNER JOIN tblpurchaseorders ON tblpurchaseorders.por_id = tblinventories.por_id WHERE inv_isdeleted = false AND inv_quantityleft > 0 AND bnc_id = $2 GROUP BY pro_id) AS inventories ON inventories.pro_id = tblproducts.pro_id WHERE pro_isactive=${isActive} ${
      stockCheck ? 'AND quantity > 0' : ''
    } AND ( LOWER(pro_name) LIKE LOWER($1) OR LOWER(tblproducts.pro_id) LIKE LOWER($1) ) ORDER BY pro_id`,
    ['%' + keyword + '%', branchId]
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        productId: row.pro_id,
        name: row.pro_name,
        marginPrice: Number((Number(row.prl_sellingprice) - Number(row.netpurchaseprice)).toFixed(4)),
        unitSellingPrice: parseFloat(row.prl_sellingprice),
        discountPrice: parseFloat(row.prl_discountprice),
        stockAvailable: parseInt(row.quantity),
        vatPercentageId: row.vatp_id,
      };
    });
    res.status(200).json({ data, message: `${results.rowCount} product found.` });
  } else {
    res.status(404).json({ message: 'No product found.' });
  }
};

const createProduct = async (req, res) => {
  const { id } = req.user;
  const { error, value } = Joi.object({
    name: Joi.string().trim().min(5).max(70).required(),
    altName: Joi.string().trim().min(0).max(70).required(),
    sellingPrice: Joi.number().precision(2).required(),
    discountPrice: Joi.number().precision(2).required(),
    vatPercentageId: Joi.string().trim().min(5).max(10).required(),
    brandId: Joi.string().trim().min(5).max(10).required(),
    categoryId: Joi.string().trim().min(5).max(10).required(),
    branchId: Joi.string().trim().min(5).max(10).required(),
    unitTypeId: Joi.string().trim().min(5).max(10).required(),
  }).validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name, altName, sellingPrice, discountPrice, vatPercentageId, brandId, categoryId, branchId, unitTypeId } = value;

  const productsResults = await db.query('SELECT pro_name FROM tblproducts WHERE lower(pro_name) = lower($1)', [name]);
  if (productsResults.rowCount > 0) {
    return res.status(400).json({ message: 'Product Name or Code already exist.' });
  }

  const results = await db.query(
    'INSERT INTO tblproducts(pro_name, pro_altname, vatp_id, bnd_id, cat_id, unty_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, altName, vatPercentageId, brandId, categoryId, unitTypeId]
  );
  if (results.rowCount === 1) {
    await db.query('INSERT INTO tblpricelists(prl_sellingprice, prl_discountprice, pro_id, bnc_id, usr_id) VALUES ($1, $2, $3, $4, $5)', [
      sellingPrice,
      discountPrice,
      results.rows[0].pro_id,
      branchId,
      id,
    ]);

    return res.status(201).json({ message: 'Product created successfully.' });
  }
};

const updateProductbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = Joi.object({
    name: Joi.string().trim().min(5).max(70).required(),
    altName: Joi.string().trim().min(0).max(70).required(),
    sellingPrice: Joi.number().precision(2).required(),
    discountPrice: Joi.number().precision(2).required(),
    isActive: Joi.boolean().required(),
    vatPercentageId: Joi.string().trim().min(5).max(10).required(),
    brandId: Joi.string().trim().min(5).max(10).required(),
    categoryId: Joi.string().trim().min(5).max(10).required(),
    branchId: Joi.string().trim().min(5).max(10).required(),
    unitTypeId: Joi.string().trim().min(5).max(10).required(),
  }).validate(req.body);

  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }

  const { name, altName, sellingPrice, discountPrice, isActive, vatPercentageId, brandId, categoryId, branchId, unitTypeId } = value;

  const productsResults = await db.query('SELECT pro_id FROM tblproducts WHERE pro_id=$1', [id]);
  if (productsResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblproducts SET pro_name=$2, pro_altname=$3, pro_isactive=$4, vatp_id=$5, bnd_id=$6, cat_id=$7, unty_id=$8 WHERE pro_id=$1 RETURNING pro_id',
    [id, name, altName, isActive, vatPercentageId, brandId, categoryId, unitTypeId]
  );

  if (results.rowCount === 1) {
    await db.query('UPDATE tblpricelists SET prl_sellingprice=$1, prl_discountprice=$2 WHERE pro_id=$3 AND bnc_id=$4', [
      sellingPrice,
      discountPrice,
      results.rows[0].pro_id,
      branchId,
    ]);
    return res.status(200).json({ message: 'Product updated successfully.' });
  }
};

const deleteProductbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT pro_id FROM tblproducts WHERE pro_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Product does not exist.' });
  }

  await db.query('DELETE FROM tblproducts WHERE pro_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getProducts,
  getProductsbySearch,
  createProduct,
  updateProductbyId,
  deleteProductbyId,
};
