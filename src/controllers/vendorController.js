const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(5).max(80).required(),
    altname: Joi.string().trim().min(0).max(80).required(),
    buildingno: Joi.string().trim().min(0).max(40).required(),
    streetno: Joi.string().trim().min(0).max(15).required(),
    district: Joi.string().trim().min(0).max(25).required(),
    pobox: Joi.string().trim().min(0).max(10).required(),
    city: Joi.string().trim().min(0).max(20).required(),
    citycode: Joi.string().trim().min(0).max(10).required(),
    country: Joi.string().trim().min(0).max(30).required(),
    phone: Joi.string().trim().min(0).max(9).required(),
    landline: Joi.string().trim().min(0).max(9).required(),
    email: Joi.string().trim().min(0).max(100).required(),
    website: Joi.string().trim().min(0).max(100).required(),
    vatno: Joi.string().trim().min(0).max(15).required(),
    crno: Joi.string().trim().min(0).max(10).required(),
  }).validate(payload);
};

const validatSearchPayload = (payload) => {
  return Joi.object({
    keyword: Joi.string().trim().min(1).max(15).required(),
  }).validate(payload);
};

const getAllVendors = async (req, res) => {
  const results = await db.query(
    'SELECT ven_id, ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_phone, ven_landline, ven_email, ven_website, ven_vatno, ven_crno FROM tblvendors ORDER BY ven_id'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.ven_id,
        name: row.ven_name,
        altname: row.ven_altname,
        buildingno: row.ven_buildingno,
        streetno: row.ven_streetno,
        district: row.ven_district,
        pobox: row.ven_pobox,
        city: row.ven_city,
        citycode: row.ven_citycode,
        country: row.ven_country,
        phone: row.ven_phone,
        landline: row.ven_landline,
        email: row.ven_email,
        website: row.ven_website,
        vatno: row.ven_vatno,
        crno: row.ven_crno,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getAllVendorsbySearch = async (req, res) => {
  const { error, value } = validatSearchPayload(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { keyword } = value;

  const results = await db.query(
    'SELECT ven_id, ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_phone, ven_landline, ven_email, ven_website, ven_vatno, ven_crno FROM tblvendors WHERE ven_vatno LIKE $1 ORDER BY ven_id',
    ['%' + keyword + '%']
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.ven_id,
        name: row.ven_name,
        altname: row.ven_altname,
        buildingno: row.ven_buildingno,
        streetno: row.ven_streetno,
        district: row.ven_district,
        pobox: row.ven_pobox,
        city: row.ven_city,
        citycode: row.ven_citycode,
        country: row.ven_country,
        phone: row.ven_phone,
        landline: row.ven_landline,
        email: row.ven_email,
        website: row.ven_website,
        vatno: row.ven_vatno,
        crno: row.ven_crno,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createVendor = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno } =
    value;

  const vendorsResults = await db.query('SELECT ven_vatno FROM tblvendors WHERE ven_vatno=$1', [vatno]);
  if (vendorsResults.rowCount === 1) {
    return res.status(400).json({ message: 'Vendor already exist.' });
  }

  const results = await db.query(
    'INSERT INTO tblvendors(ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_phone, ven_landline, ven_email, ven_website, ven_vatno, ven_crno) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
    [name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno]
  );
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Vendor created successfully.' });
  }
};

const updateVendorbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }

  const { name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno } =
    value;
  const vendorsResults = await db.query('SELECT ven_id FROM tblvendors WHERE ven_id=$1', [id]);
  if (vendorsResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblvendors SET ven_name=$2, ven_altname=$3, ven_buildingno=$4, ven_streetno=$5, ven_district=$6, ven_pobox=$7, ven_city=$8, ven_citycode=$9, ven_country=$10, ven_phone=$11, ven_landline=$12, ven_email=$13, ven_website=$14, ven_vatno=$15, ven_crno=$16 WHERE ven_id=$1 RETURNING ven_id',
    [id, name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno]
  );

  if (results.rowCount === 1) {
    return res.status(200).json({ message: 'Vendor updated successfully.' });
  }
};

const deleteVendorbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT ven_id FROM tblvendors WHERE ven_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Vendor does not exist.' });
  }

  await db.query('DELETE FROM tblvendors WHERE ven_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllVendors,
  getAllVendorsbySearch,
  createVendor,
  updateVendorbyId,
  deleteVendorbyId,
};
