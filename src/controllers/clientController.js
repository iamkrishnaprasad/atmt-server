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
    cvat: Joi.string().trim().length(15),
    crnum: Joi.string().trim().min(0).max(20),
  }).validate(payload);
};

const validateSearchPayload = (payload) => {
  return Joi.object({
    keyword: Joi.string().trim().min(1).max(15).required(),
  }).validate(payload);
};

const getAllClients = async (req, res) => {
  const results = await db.query(
    'SELECT cli_id, cli_name, cli_altname, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_contact, cli_email, cli_website, cli_cvat, cli_crnum FROM tblclients ORDER BY cli_id'
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.cli_id,
        name: row.cli_name,
        altname: row.cli_altname,
        buildingno: row.cli_buildingno,
        streetno: row.cli_streetno,
        district: row.cli_district,
        pobox: row.cli_pobox,
        city: row.cli_city,
        citycode: row.cli_citycode,
        country: row.cli_country,
        contact: row.cli_contact,
        email: row.cli_email,
        website: row.cli_website,
        cvat: row.cli_cvat,
        crnum: row.cli_crnum,
      };
    });
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const searchClientbyCVAT = async (req, res) => {
  const { error, value } = validateSearchPayload(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { keyword } = value;

  const results = await db.query(
    'SELECT cli_id, cli_name, cli_altname, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_contact, cli_email, cli_website, cli_cvat, cli_crnum FROM tblclients WHERE cli_cvat LIKE $1 ORDER BY cli_id',
    ['%' + keyword + '%']
  );

  if (results.rowCount > 0) {
    const data = results.rows.map((row) => {
      return {
        id: row.cli_id,
        name: row.cli_name,
        altname: row.cli_altname,
        buildingno: row.cli_buildingno,
        streetno: row.cli_streetno,
        district: row.cli_district,
        pobox: row.cli_pobox,
        city: row.cli_city,
        citycode: row.cli_citycode,
        country: row.cli_country,
        contact: row.cli_contact,
        email: row.cli_email,
        website: row.cli_website,
        cvat: row.cli_cvat,
        crnum: row.cli_crnum,
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

  const clientsResults = await db.query('SELECT cli_cvat FROM tblclients WHERE cli_cvat=$1', [
    cvat,
  ]);
  if (clientsResults.rowCount === 1) {
    return res.status(400).json({ message: 'Client already exist.' });
  }

  const results = await db.query(
    'INSERT INTO tblclients(cli_name, cli_altname, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_contact, cli_email, cli_website, cli_cvat, cli_crnum) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
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
  const clientsResults = await db.query('SELECT cli_id FROM tblclients WHERE cli_id=$1', [id]);
  if (clientsResults.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid Request.' });
  }

  const results = await db.query(
    'UPDATE tblclients SET cli_name=$2, cli_altname=$3, cli_buildingno=$4, cli_streetno=$5, cli_district=$6, cli_pobox=$7, cli_city=$8, cli_citycode=$9, cli_country=$10, cli_contact=$11, cli_email=$12, cli_website=$13, cli_cvat=$14, cli_crnum=$15 WHERE cli_id=$1 RETURNING cli_id',
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
  searchClientbyCVAT,
  createClient,
  updateClientbyId,
  deleteClientbyId,
};
