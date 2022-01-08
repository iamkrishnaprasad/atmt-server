const Joi = require('joi');
const db = require('../db');

const validatSearchPayload = (payload) => {
  return Joi.object({
    keyword: Joi.string().trim().min(1).max(15).required(),
  }).validate(payload);
};

const getActiveProducts = async (req, res) => {
  const results = await db.query(
    'SELECT tblproducts.pro_id, pro_name, pro_altname, pro_code, pro_description, pro_isactive, vat_id, bnd_id, cat_id, prl_sellingprice, prl_discountprice, stk_quantity, stk_lowstockvalue FROM tblproducts INNER JOIN tblpricelists ON tblpricelists.pro_id = tblproducts.pro_id INNER JOIN tblstocks ON tblstocks.pro_id = tblproducts.pro_id WHERE pro_isactive=true ORDER BY pro_id'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.pro_id,
        name: row.pro_name,
        altname: row.pro_altname,
        code: row.pro_code,
        description: row.pro_description,
        sellingPrice: parseFloat(row.prl_sellingprice),
        discountPrice: parseFloat(row.prl_discountprice),
        stockQty: parseInt(row.stk_quantity),
        lowStockValue: parseInt(row.stk_lowstockvalue),
        isActive: row.pro_isactive,
        vatId: row.vat_id,
        brandId: row.bnd_id,
        categoryId: row.cat_id,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getAllProducts = async (req, res) => {
  const results = await db.query(
    'SELECT tblproducts.pro_id, pro_name, pro_altname, pro_code, pro_description, pro_isactive, vat_id, bnd_id, cat_id, prl_sellingprice, prl_discountprice, stk_quantity, stk_lowstockvalue FROM tblproducts INNER JOIN tblpricelists ON tblpricelists.pro_id = tblproducts.pro_id INNER JOIN tblstocks ON tblstocks.pro_id = tblproducts.pro_id ORDER BY pro_id'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.pro_id,
        name: row.pro_name,
        altname: row.pro_altname,
        code: row.pro_code,
        description: row.pro_description,
        sellingPrice: parseFloat(row.prl_sellingprice),
        discountPrice: parseFloat(row.prl_discountprice),
        stockQty: parseInt(row.stk_quantity),
        lowStockValue: parseInt(row.stk_lowstockvalue),
        isActive: row.pro_isactive,
        vatId: row.vat_id,
        brandId: row.bnd_id,
        categoryId: row.cat_id,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getActiveProductsbySearch = async (req, res) => {
  const { error, value } = validatSearchPayload(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { keyword } = value;

  const results = await db.query(
    'SELECT tblproducts.pro_id, pro_name, pro_altname, pro_code, pro_description, pro_isactive, vat_id, bnd_id, cat_id, prl_sellingprice, prl_discountprice, stk_quantity, stk_lowstockvalue FROM tblproducts INNER JOIN tblpricelists ON tblpricelists.pro_id = tblproducts.pro_id INNER JOIN tblstocks ON tblstocks.pro_id = tblproducts.pro_id WHERE pro_isactive=true AND lower(pro_name) LIKE lower($1) ORDER BY pro_id',
    ['%' + keyword + '%']
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.pro_id,
        name: row.pro_name,
        altname: row.pro_altname,
        code: row.pro_code,
        description: row.pro_description,
        sellingPrice: parseFloat(row.prl_sellingprice),
        discountPrice: parseFloat(row.prl_discountprice),
        stockQty: parseInt(row.stk_quantity),
        lowStockValue: parseInt(row.stk_lowstockvalue),
        isActive: row.pro_isactive,
        vatId: row.vat_id,
        brandId: row.bnd_id,
        categoryId: row.cat_id,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getAllProductsbySearch = async (req, res) => {
  const { error, value } = validatSearchPayload(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { keyword } = value;

  const results = await db.query(
    'SELECT tblproducts.pro_id, pro_name, pro_altname, pro_code, pro_description, pro_isactive, vat_id, bnd_id, cat_id, prl_sellingprice, prl_discountprice, stk_quantity, stk_lowstockvalue FROM tblproducts INNER JOIN tblpricelists ON tblpricelists.pro_id = tblproducts.pro_id INNER JOIN tblstocks ON tblstocks.pro_id = tblproducts.pro_id WHERE lower(pro_name) LIKE lower($1) ORDER BY pro_id',
    ['%' + keyword + '%']
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.pro_id,
        name: row.pro_name,
        altname: row.pro_altname,
        code: row.pro_code,
        description: row.pro_description,
        sellingPrice: parseFloat(row.pro_sellingprice),
        discountPrice: parseFloat(row.pro_discountprice),
        stockQty: parseInt(row.stk_quantity),
        lowStockValue: parseInt(row.stk_lowstockvalue),
        isActive: row.pro_isactive,
        vatId: row.vat_id,
        brandId: row.bnd_id,
        categoryId: row.cat_id,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    altname: Joi.string().trim().min(0).max(50).required(),
    code: Joi.string().trim().min(0).max(10).required(),
    description: Joi.string().trim().min(0).max(200).required(),
    sellingPrice: Joi.number().precision(2).required(),
    discountPrice: Joi.number().precision(2).required(),
    lowStockValue: Joi.number().min(1).max(200).required(),
    vatId: Joi.string().trim().min(5).max(10).required(),
    brandId: Joi.string().trim().min(5).max(10).required(),
    categoryId: Joi.string().trim().min(5).max(10).required(),
    branchId: Joi.string().trim().min(5).max(10).required(),
  }).validate(payload);
};

const createProduct = async (req, res) => {
  const { id } = req.user;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const {
    name,
    altname,
    code,
    description,
    sellingPrice,
    discountPrice,
    lowStockValue,
    vatId,
    brandId,
    categoryId,
    branchId,
  } = value;

  const productsResults = await db.query(
    'SELECT pro_name, pro_code FROM tblproducts WHERE lower(pro_name) = lower($1) OR pro_code = $2',
    [name, code]
  );
  if (productsResults.rowCount > 0) {
    return res.status(400).json({ message: 'Product Name or Code already exist.' });
  }

  const results = await db.query(
    'INSERT INTO tblproducts(pro_name, pro_altname, pro_code, pro_description, vat_id, bnd_id, cat_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, altname, code, description, vatId, brandId, categoryId]
  );
  if (results.rowCount === 1) {
    await db.query(
      'INSERT INTO tblpricelists(prl_sellingprice, prl_discountprice, pro_id, bnc_id, usr_id) VALUES ($1, $2, $3, $4, $5)',
      [sellingPrice, discountPrice, results.rows[0].pro_id, branchId, id]
    );

    await db.query(
      'INSERT INTO tblstocks(stk_lowstockvalue, pro_id, bnc_id, usr_id) VALUES ($1, $2, $3, $4)',
      [lowStockValue, results.rows[0].pro_id, branchId, id]
    );
    // const data = results.rows.map((row) => {
    //   return {
    //     id: row.pro_id,
    //     name: row.pro_name,
    //     altname: row.pro_altname,
    //     code: row.pro_code,
    //     description: row.pro_description,
    //     sellingPrice: parseFloat(row.pro_sellingprice),
    //     discountPrice: parseFloat(row.pro_discountprice),
    //     isActive: row.pro_isactive,
    //     vatId: row.vat_id,
    //     brandId: row.bnd_id,
    //     categoryId: row.cat_id,
    //   };
    // });
    return res.status(201).json({ message: 'Product created successfully.' });
  }
};

const updateProductbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    altname: Joi.string().trim().min(0).max(50).required(),
    code: Joi.string().trim().min(0).max(10).required(),
    description: Joi.string().trim().min(0).max(200).required(),
    sellingPrice: Joi.number().precision(2).required(),
    discountPrice: Joi.number().precision(2).required(),
    lowStockValue: Joi.number().min(1).max(200).required(),
    isActive: Joi.boolean().required(),
    vatId: Joi.string().trim().min(5).max(10).required(),
    brandId: Joi.string().trim().min(5).max(10).required(),
    categoryId: Joi.string().trim().min(5).max(10).required(),
    branchId: Joi.string().trim().min(5).max(10).required(),
  }).validate(req.body);

  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }

  const {
    name,
    altname,
    code,
    description,
    sellingPrice,
    discountPrice,
    lowStockValue,
    isActive,
    vatId,
    brandId,
    categoryId,
    branchId,
  } = value;

  const productsResults = await db.query('SELECT pro_id FROM tblproducts WHERE pro_id=$1', [id]);
  if (productsResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblproducts SET pro_name=$2, pro_altname=$3, pro_code=$4, pro_description=$5, pro_isactive=$6, vat_id=$7, bnd_id=$8, cat_id=$9 WHERE pro_id=$1 RETURNING pro_id',
    [id, name, altname, code, description, isActive, vatId, brandId, categoryId]
  );

  if (results.rowCount === 1) {
    await db.query('UPDATE tblstocks SET stk_lowstockvalue=$1 WHERE pro_id=$2 AND bnc_id=$3', [
      lowStockValue,
      results.rows[0].pro_id,
      branchId,
    ]);

    await db.query(
      'UPDATE tblpricelists SET prl_sellingprice=$1, prl_discountprice=$2 WHERE pro_id=$3 AND bnc_id=$4',
      [sellingPrice, discountPrice, results.rows[0].pro_id, branchId]
    );
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
  getActiveProducts,
  getAllProducts,
  getActiveProductsbySearch,
  getAllProductsbySearch,
  createProduct,
  updateProductbyId,
  deleteProductbyId,
};
