const Joi = require('joi');
const db = require('../db');

const getInventories = async (purchaseOrderId) => {
  const inventoriesResult = await db.query(
    'SELECT pro_id, vat_id, inv_purchasepriceperitem, inv_sellingpriceperitem, inv_quantity FROM tblinventories WHERE por_id = $1',
    [purchaseOrderId]
  );
  return inventoriesResult.rows.map((row) => {
    return {
      productId: row.pro_id,
      vatId: row.vat_id,
      purchasePrice: row.inv_purchasepriceperitem,
      sellingPrice: row.inv_sellingpriceperitem,
      quantity: row.inv_quantity,
    };
  });
};
const getTotalInventoriesPrice = async (purchaseOrderId) => {
  const inventoriesResult = await db.query('SELECT SUM(inv_purchasepriceperitem) AS totalprice FROM tblinventories WHERE por_id = $1', [
    purchaseOrderId,
  ]);
  if (inventoriesResult.rowCount === 1) {
    return inventoriesResult.rows[0].totalprice;
  }
};

const getAllPurchaseOrders = async (req, res) => {
  const results = await db.query(
    'SELECT por_id, por_purchaseorderno, por_purchasedate, bnc_id, ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_contact, ven_email, ven_website, ven_vatno, ven_crno, usr_id FROM tblpurchaseorders LEFT OUTER JOIN tblvendors ON tblvendors.ven_id = tblpurchaseorders.ven_id ORDER BY por_id DESC'
  );

  if (results.rowCount > 0) {
    const data = await Promise.all(
      results.rows.map(async (row) => {
        return {
          id: row.por_id,
          purchaseorderno: row.por_purchaseorderno,
          purchasedate: row.por_purchasedate,
          branchId: row.bnc_id,
          vendorName: `${row.ven_name} ${row.ven_altname ? '( ' + row.ven_altname + ' )' : ''}`,
          vendorVATNo: row.ven_vatno,
          vendorCRNo: row.ven_crno,
          totalInventoriesPrice: await getTotalInventoriesPrice(row.por_id),
          // {
          //   name: row.ven_name,
          //   altName: row.ven_altname,
          //   buildingno: row.ven_buildingno,
          //   streetno: row.ven_streetno,
          //   district: row.ven_district,
          //   pobox: row.ven_pobox,
          //   city: row.ven_city,
          //   citycode: row.ven_citycode,
          //   country: row.ven_country,
          //   contact: row.ven_contact,
          //   email: row.ven_email,
          //   website: row.ven_website,
          //   vatno: row.ven_vatno,
          //   crno: row.ven_crno,
          // },
          // inventories: await getInventories(row.por_id),
        };
      })
    );
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getPurchaseOrderbyId = async (req, res) => {
  const { id } = req.params;
  const results = await db.query(
    'SELECT por_id, por_purchaseorderno, por_purchasedate, bnc_id , ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_contact, ven_email, ven_website, ven_vatno, ven_crno, usr_id FROM tblpurchaseorders LEFT OUTER JOIN tblvendors ON tblvendors.ven_id = tblpurchaseorders.ven_id WHERE por_id=$1 ORDER BY por_id DESC',
    [id]
  );

  if (results.rowCount > 0) {
    const data = await Promise.all(
      results.rows.map(async (row) => {
        return {
          id: row.por_id,
          purchaseorderno: row.por_purchaseorderno,
          purchasedate: row.por_purchasedate,
          branchId: row.bnc_id,
          vendor: {
            name: row.ven_name,
            altName: row.ven_altname,
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
            vatno: row.ven_vatno,
            crno: row.ven_crno,
          },
          inventories: await getInventories(row.por_id),
        };
      })
    );
    res.status(200).json(data[0]);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const validate = (payload) => {
  return Joi.object({
    purchaseorderno: Joi.string().trim().min(0).max(20).required(),
    purchasedate: Joi.string().trim().min(5).max(20).required(),
    branchId: Joi.string().trim().max(10).required(),
    vendor: Joi.object({
      name: Joi.string().trim().min(5).max(50).required(),
      altName: Joi.string().trim().min(0).max(50),
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
      vatno: Joi.string().trim().length(15).required(),
      crno: Joi.string().trim().min(0).max(10),
    }),
    inventories: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().trim().max(10).required(),
          purchaseprice: Joi.number().precision(2).required(),
          sellingprice: Joi.number().precision(2).required(),
          quantity: Joi.number().greater(0).required(),
          vatId: Joi.string().trim().max(10).required(),
        })
      )
      .min(1)
      .required(),
  }).validate(payload);
};

const createPurchaseOrder = async (req, res) => {
  const { id } = req.user;
  const { error, value } = validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { purchaseorderno, purchasedate, branchId, vendor, inventories } = value;
  const { name, altName, buildingno, streetno, district, pobox, city, citycode, country, contact, email, website, vatno, crno } = vendor;

  let venId = null;

  const vendorsResults = await db.query('SELECT ven_id FROM tblvendors WHERE ven_vatno=$1', [vatno]);
  if (vendorsResults.rowCount === 0) {
    const vendorCreationResult = await db.query(
      'INSERT INTO tblvendors(ven_name, ven_altname, ven_buildingno, ven_streetno, ven_district, ven_pobox, ven_city, ven_citycode, ven_country, ven_contact, ven_email, ven_website, ven_vatno, ven_crno) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING ven_id',
      [name, altName, buildingno, streetno, district, pobox, city, citycode, country, contact, email, website, vatno, crno]
    );
    venId = vendorCreationResult.rows[0].ven_id;
  } else if (vendorsResults.rowCount === 1) {
    venId = vendorsResults.rows[0].ven_id;
  }

  if (venId !== null) {
    const purchaseOrderResults = await db.query(
      'INSERT INTO tblpurchaseorders(por_purchaseorderno, por_purchasedate, ven_id, bnc_id, usr_id) VALUES ($1, $2, $3, $4, $5) RETURNING por_id',
      [purchaseorderno, purchasedate, venId, branchId, id]
    );
    if (purchaseOrderResults.rowCount === 1) {
      const purchaseOrderId = purchaseOrderResults.rows[0].por_id;
      inventories.forEach(async (inventory) => {
        const { productId, purchaseprice, sellingprice, quantity, vatId } = inventory;
        // compare sellingprice with existing product then update if needed
        const productResults = await db.query('SELECT prl_sellingprice FROM tblpricelists WHERE pro_id=$1 AND bnc_id=$2', [
          productId,
          branchId,
        ]);

        if (productResults.rowCount === 1) {
          if (sellingprice !== productResults.rows[0].prl_sellingprice) {
            await db.query('UPDATE tblpricelists SET prl_sellingprice=$3 WHERE pro_id=$1 AND bnc_id=$2', [
              productId,
              branchId,
              sellingprice,
            ]);
          }
        }
        // update the quantity in stock also
        const stockResults = await db.query('SELECT stk_quantity FROM tblstocks WHERE pro_id=$1 AND bnc_id=$2', [productId, branchId]);

        if (stockResults.rowCount === 1) {
          await db.query('UPDATE tblstocks SET stk_quantity=$3 WHERE pro_id=$1 AND bnc_id=$2', [
            productId,
            branchId,
            quantity + stockResults.rows[0].stk_quantity,
          ]);
        }

        await db.query(
          'INSERT INTO tblinventories(inv_addedby, inv_purchasepriceperitem, inv_sellingpriceperitem, inv_quantity, por_id, pro_id, vat_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING por_id',
          [id, purchaseprice, sellingprice, quantity, purchaseOrderId, productId, vatId]
        );
      });
      return res.status(200).json({ message: 'Purchase order successfully.' });
    }
  }
};
const updatePurchaseOrderbyId = async (req, res) => {};
const deletePurchaseOrderbyId = async (req, res) => {
  // const { id } = req.params;
  // const results = await db.query('SELECT pro_id FROM tblproducts WHERE pro_id=$1', [id]);
  // if (!results.rowCount > 0) {
  //   return res.status(404).json({ message: 'Product does not exist.' });
  // }
  // await db.query('DELETE FROM tblproducts WHERE pro_id=$1', [id]);
  // res.status(204).json({
  //   status: 'Success',
  // });
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderbyId,
  createPurchaseOrder,
  updatePurchaseOrderbyId,
  deletePurchaseOrderbyId,
};
