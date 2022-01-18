const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    altname: Joi.string().trim().min(0).max(50),
    buildingno: Joi.string().trim().min(0).max(10),
    streetno: Joi.string().trim().min(0).max(10),
    district: Joi.string().trim().min(0).max(20),
    pobox: Joi.string().trim().min(0).max(10),
    city: Joi.string().trim().min(0).max(20),
    citycode: Joi.string().trim().min(0).max(10),
    country: Joi.string().trim().min(0).max(20),
    phone: Joi.string().trim().length(9),
    landline: Joi.string().trim().length(9),
    email: Joi.string().trim().min(0).max(100),
    website: Joi.string().trim().min(0).max(100),
    vatno: Joi.string().trim().length(15).required(),
    crno: Joi.string().trim().min(0).max(10),
  }).validate(payload);
};

const getAllBranches = async (req, res) => {
  const results = await db.query(
    'SELECT bnc_id, bnc_name, bnc_altname, bnc_buildingno, bnc_streetno, bnc_district, bnc_pobox, bnc_city, bnc_citycode, bnc_country, bnc_phone, bnc_landline, bnc_email, bnc_website, bnc_vatno, bnc_crno FROM tblbranches ORDER BY bnc_id'
  );

  const data = results.rows.map((row) => {
    return {
      id: row.bnc_id,
      name: row.bnc_name,
      altname: row.bnc_altname,
      buildingno: row.bnc_buildingno,
      streetno: row.bnc_streetno,
      district: row.bnc_district,
      pobox: row.bnc_pobox,
      city: row.bnc_city,
      citycode: row.bnc_citycode,
      country: row.bnc_country,
      phone: row.bnc_phone,
      landline: row.bnc_landline,
      email: row.bnc_email,
      website: row.bnc_website,
      vatno: row.bnc_vatno,
      crno: row.bnc_crno,
    };
  });
  res.status(200).json(data);
};

const createBranch = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno } =
    value;

  const branchResults = await db.query('SELECT bnc_name, bnc_vatno FROM tblbranches WHERE bnc_name=$1 OR bnc_vatno=$2', [name, vatno]);
  if (branchResults.rowCount > 0) {
    return res.status(400).json({ message: 'Branch already exist.' });
  }
  const results = await db.query(
    'INSERT INTO tblbranches( bnc_name, bnc_altname, bnc_buildingno, bnc_streetno, bnc_district, bnc_pobox, bnc_city, bnc_citycode, bnc_country, bnc_phone, bnc_landline, bnc_email, bnc_website, bnc_vatno, bnc_crno) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
    [name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno]
  );
  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.bnc_id,
        name: row.bnc_name,
        altname: row.bnc_altname,
        buildingno: row.bnc_buildingno,
        streetno: row.bnc_streetno,
        district: row.bnc_district,
        pobox: row.bnc_pobox,
        city: row.bnc_city,
        citycode: row.bnc_citycode,
        country: row.bnc_country,
        phone: row.bnc_phone,
        landline: row.bnc_landline,
        email: row.bnc_email,
        website: row.bnc_website,
        vatno: row.bnc_vatno,
        crno: row.bnc_crno,
      };
    });
    return res.status(201).json({ data, message: 'Branch created successfully.' });
  }
};

const updateBranchbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno } =
    value;

  const branchResults = await db.query('SELECT bnc_id FROM tblbranches WHERE bnc_id=$1', [id]);
  if (branchResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblbranches SET bnc_name=$2, bnc_altname=$3, bnc_buildingno=$4, bnc_streetno=$5, bnc_district=$6, bnc_pobox=$7, bnc_city=$8, bnc_citycode=$9, bnc_country=$10, bnc_phone=$11, bnc_landline=$12, bnc_email=$13, bnc_website=$14, bnc_vatno=$15, bnc_crno=$16 WHERE bnc_id=$1 RETURNING *',
    [id, name, altname, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno]
  );
  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.bnc_id,
        name: row.bnc_name,
        altname: row.bnc_altname,
        buildingno: row.bnc_buildingno,
        streetno: row.bnc_streetno,
        district: row.bnc_district,
        pobox: row.bnc_pobox,
        city: row.bnc_city,
        citycode: row.bnc_citycode,
        country: row.bnc_country,
        phone: row.bnc_phone,
        landline: row.bnc_landline,
        email: row.bnc_email,
        website: row.bnc_website,
        vatno: row.bnc_vatno,
        crno: row.bnc_crno,
      };
    });
    return res.status(200).json({ data, message: 'Branch updated successfully.' });
  }
};

const deleteBranchbyId = async (req, res) => {
  const { id } = req.params;
  const results = await db.query('SELECT bnc_id FROM tblbranches WHERE bnc_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Branch does not exist.' });
  }
  await db.query('DELETE FROM tblbranches WHERE bnc_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = { getAllBranches, createBranch, updateBranchbyId, deleteBranchbyId };
