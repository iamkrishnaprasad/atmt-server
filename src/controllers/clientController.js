const Joi = require('joi');
const db = require('../db');

const validate = (payload) => {
  return Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    altname: Joi.string().trim().min(0).max(50).required(),
    type: Joi.string().trim().length(1),
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
    vatno: Joi.string().trim().length(15).required(),
    crno: Joi.string().trim().length(10).required(),
  }).validate(payload);
};

const validateSearchPayload = (payload) => {
  return Joi.object({
    keyword: Joi.string().trim().min(1).max(15).required(),
  }).validate(payload);
};

const getAllClients = async (req, res) => {
  const results = await db.query(
    'SELECT cli_id, cli_name, cli_altname, cli_type, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_phone, cli_landline, cli_email, cli_website, cli_vatno, cli_crno FROM tblclients ORDER BY cli_id'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.cli_id,
        name: row.cli_name,
        altname: row.cli_altname,
        type: row.cli_type,
        buildingno: row.cli_buildingno,
        streetno: row.cli_streetno,
        district: row.cli_district,
        pobox: row.cli_pobox,
        city: row.cli_city,
        citycode: row.cli_citycode,
        country: row.cli_country,
        phone: row.cli_phone,
        landline: row.cli_landline,
        email: row.cli_email,
        website: row.cli_website,
        vatno: row.cli_vatno,
        crno: row.cli_crno,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const searchClientbyVATNo = async (req, res) => {
  const { error, value } = validateSearchPayload(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { keyword } = value;

  const results = await db.query(
    'SELECT cli_id, cli_name, cli_altname, cli_type, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_phone, cli_landline, cli_email, cli_website, cli_vatno, cli_crno FROM tblclients WHERE cli_vatno LIKE $1 ORDER BY cli_id',
    ['%' + keyword + '%']
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.cli_id,
        name: row.cli_name,
        altname: row.cli_altname,
        type: row.cli_type,
        buildingno: row.cli_buildingno,
        streetno: row.cli_streetno,
        district: row.cli_district,
        pobox: row.cli_pobox,
        city: row.cli_city,
        citycode: row.cli_citycode,
        country: row.cli_country,
        phone: row.cli_phone,
        landline: row.cli_landline,
        email: row.cli_email,
        website: row.cli_website,
        vatno: row.cli_vatno,
        crno: row.cli_crno,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const createClient = async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const {
    name,
    altname,
    type,
    buildingno,
    streetno,
    district,
    pobox,
    city,
    citycode,
    country,
    phone,
    landline,
    email,
    website,
    vatno,
    crno,
  } = value;

  const clientsResults = await db.query('SELECT cli_vatno FROM tblclients WHERE cli_vatno=$1', [vatno]);
  if (clientsResults.rowCount === 1) {
    return res.status(400).json({ message: 'Client already exist.' });
  }

  const results = await db.query(
    'INSERT INTO tblclients(cli_name, cli_altname, cli_type, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_phone, cli_landline, cli_email, cli_website, cli_vatno, cli_crno) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
    [name, altname, type, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno]
  );
  if (results.rowCount === 1) {
    return res.status(201).json({ message: 'Client created successfully.' });
  }
};

const updateClientbyId = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }

  const {
    name,
    altname,
    type,
    buildingno,
    streetno,
    district,
    pobox,
    city,
    citycode,
    country,
    phone,
    landline,
    email,
    website,
    vatno,
    crno,
  } = value;
  const clientsResults = await db.query('SELECT cli_id FROM tblclients WHERE cli_id=$1', [id]);
  if (clientsResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblclients SET cli_name=$2, cli_altname=$3, cli_type=$4, cli_buildingno=$5, cli_streetno=$6, cli_district=$7, cli_pobox=$8, cli_city=$9, cli_citycode=$10, cli_country=$11, cli_phone=$12, cli_landline=$13, cli_email=$14, cli_website=$15, cli_vatno=$16, cli_crno=$17 WHERE cli_id=$1 RETURNING cli_id',
    [id, name, altname, type, buildingno, streetno, district, pobox, city, citycode, country, phone, landline, email, website, vatno, crno]
  );

  if (results.rowCount === 1) {
    return res.status(200).json({ message: 'Client updated successfully.' });
  }
};

const deleteClientbyId = async (req, res) => {
  const { id } = req.params;

  const results = await db.query('SELECT cli_id FROM tblclients WHERE cli_id=$1', [id]);
  if (!results.rowCount > 0) {
    return res.status(404).json({ message: 'Client does not exist.' });
  }

  await db.query('DELETE FROM tblclients WHERE cli_id=$1', [id]);
  res.status(204).json({
    status: 'Success',
  });
};

module.exports = {
  getAllClients,
  searchClientbyVATNo,
  createClient,
  updateClientbyId,
  deleteClientbyId,
};
