const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    altname: Joi.string().trim().min(0).max(50),
    buildingno: Joi.string().trim().min(0).max(10),
    streetno: Joi.string().trim().min(0).max(10),
    district: Joi.string().trim().min(0).max(20),
    pobox: Joi.string().trim().min(0).max(10),
    city: Joi.string().trim().min(0).max(20),
    citycode: Joi.string().trim().min(0).max(10),
    country: Joi.string().trim().min(0).max(20),
    contact: Joi.string().trim().min(0).max(9),
    email: Joi.string().trim().min(0).max(100),
    website: Joi.string().trim().min(0).max(100),
    cvat: Joi.string().trim().length(15).required(),
    crnum: Joi.string().trim().min(0).max(20),
  }).validate(payload);
};

const validatSearchPayload = (payload) => {
  return Joi.object({
    keyword: Joi.string().trim().min(1).max(15).required(),
  }).validate(payload);
};

const getAllVendors = async (req, res) => {
  const results = await db.query(
    'SELECT ven_id, ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_contact, ven_email, ven_website, ven_cvat, ven_crnum FROM tblvendors ORDER BY ven_id'
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
        contact: row.ven_contact,
        email: row.ven_email,
        website: row.ven_website,
        cvat: row.ven_cvat,
        crnum: row.ven_crnum,
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
    'SELECT ven_id, ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_contact, ven_email, ven_website, ven_cvat, ven_crnum FROM tblvendors WHERE ven_cvat LIKE $1 ORDER BY ven_id',
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
        contact: row.ven_contact,
        email: row.ven_email,
        website: row.ven_website,
        cvat: row.ven_cvat,
        crnum: row.ven_crnum,
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
  const {
    name,
    altname,
    buildingno,
    streetno,
    district,
    pobox,
    city,
    citycode,
    country,
    contact,
    email,
    website,
    cvat,
    crnum,
  } = value;

  const vendorsResults = await db.query('SELECT ven_cvat FROM tblvendors WHERE ven_cvat=$1', [
    cvat,
  ]);
  if (vendorsResults.rowCount === 1) {
    return res.status(400).json({ message: 'Vendor already exist.' });
  }

  const results = await db.query(
    'INSERT INTO tblvendors(ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_contact, ven_email, ven_website, ven_cvat, ven_crnum) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
    [
      name,
      altname,
      buildingno,
      streetno,
      district,
      pobox,
      city,
      citycode,
      country,
      contact,
      email,
      website,
      cvat,
      crnum,
    ]
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

  const {
    name,
    altname,
    buildingno,
    streetno,
    district,
    pobox,
    city,
    citycode,
    country,
    contact,
    email,
    website,
    cvat,
    crnum,
  } = value;
  const vendorsResults = await db.query('SELECT ven_id FROM tblvendors WHERE ven_id=$1', [id]);
  if (vendorsResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblvendors SET ven_name=$2, ven_altname=$3, ven_buildingno=$4, ven_streetno=$5, ven_district=$6, ven_pobox=$7, ven_city=$8, ven_citycode=$9, ven_country=$10, ven_contact=$11, ven_email=$12, ven_website=$13, ven_cvat=$14, ven_crnum=$15 WHERE ven_id=$1 RETURNING ven_id',
    [
      id,
      name,
      altname,
      buildingno,
      streetno,
      district,
      pobox,
      city,
      citycode,
      country,
      contact,
      email,
      website,
      cvat,
      crnum,
    ]
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
