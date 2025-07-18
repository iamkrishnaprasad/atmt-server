const Joi = require('joi');
const db = require('../db');
const moment = require('moment-timezone');
const generateQR = require('../utils/generateQR');

const getItems = async (orderId) => {
  const results = await db.query(
    'SELECT tblproducts.pro_id AS pro_id, pro_name, pro_altname, unty_name, vatp_value, ordi_sellingpriceperitem, ordi_discountpriceperitem, ordi_quantity FROM tblorderitems INNER JOIN tblproducts ON tblorderitems.pro_id = tblproducts.pro_id INNER JOIN tblunittypes ON tblproducts.unty_id = tblunittypes.unty_id INNER JOIN tblvatpercentage ON tblorderitems.vatp_id = tblvatpercentage.vatp_id WHERE ord_id = $1 ORDER BY ordi_id',
    [orderId]
  );
  return results.rows.map((row) => {
    return {
      code: row.pro_id.replace('PRODT', ''),
      product: {
        en: row.pro_name,
        ar: row.pro_altname,
      },
      uom: row.unty_name,
      vatPercentage: row.vatp_value,
      sellingPrice: row.ordi_sellingpriceperitem,
      discountPrice: row.ordi_discountpriceperitem,
      quantity: row.ordi_quantity,
    };
  });
};

const getNetAmount = async (orderId) => {
  const results = await db.query(
    'SELECT SUM((ordi_sellingpriceperitem*ordi_quantity)-(ordi_discountpriceperitem*ordi_quantity)) AS netamount FROM tblorderitems INNER JOIN tblvatpercentage ON tblorderitems.vatp_id = tblvatpercentage.vatp_id WHERE ord_id = $1',
    [orderId]
  );
  return results.rows[0].netamount;
};

const getTotalTax = async (orderId) => {
  const results = await db.query(
    'SELECT SUM(((ordi_sellingpriceperitem*ordi_quantity)-(ordi_discountpriceperitem*ordi_quantity))*vatp_value/100) AS totaltax FROM tblorderitems INNER JOIN tblvatpercentage ON tblorderitems.vatp_id = tblvatpercentage.vatp_id WHERE ord_id = $1',
    [orderId]
  );
  return results.rows[0].totaltax;
};

const getAllInvoices = async (req, res) => {
  const results = await db.query(
    `SELECT ord_id, ord_no, ord_created_at, ord_isdeleted, ord_validtill, ord_refno, ordt_name, pyt_name, usr_id, bnc_name, bnc_altname, bnc_buildingno, bnc_streetno, bnc_district, bnc_pobox, bnc_city, bnc_citycode, bnc_country, bnc_phone, bnc_landline, bnc_email, bnc_website, bnc_vatno, bnc_crno, cli_name, cli_altname, cli_type, cli_buildingno, cli_streetno, cli_district, cli_pobox, cli_city, cli_citycode, cli_country, cli_phone, cli_landline, cli_email, cli_website, cli_vatno, cli_crno FROM tblorders INNER JOIN tblordertypes ON tblorders.ordt_id = tblordertypes.ordt_id INNER JOIN tblbranches ON tblorders.bnc_id = tblbranches.bnc_id INNER JOIN tblclients ON tblorders.cli_id = tblclients.cli_id INNER JOIN tblpaymentterms ON tblorders.pyt_id = tblpaymentterms.pyt_id WHERE tblordertypes.ordt_id=1 OR tblordertypes.ordt_id=2 AND ord_isdeleted=false ORDER BY ord_created_at DESC`
  );
  if (results.rowCount > 0) {
    const data = await Promise.all(
      results.rows.map(async (row) => {
        const netAmount = parseFloat(await getNetAmount(row.ord_id)).toFixed(2);
        const totalTax = parseFloat(await getTotalTax(row.ord_id)).toFixed(2);
        const totalAmount = (parseFloat(netAmount) + parseFloat(totalTax)).toFixed(2);

        const qrCodePrepData = {
          name: row.bnc_name,
          vatNo: row.bnc_vatno,
          timestamp: moment(row.ord_created_at).tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS'),
          invoiceAmount: totalAmount,
          totalTax,
        };

        const qrCodeData = await generateQR(qrCodePrepData);
        return {
          id: row.ord_id,
          orderNo: row.ord_no,
          issuedDate: moment(row.ord_created_at).tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS'),
          validTill: row.ord_validtill ? moment(row.ord_validtill).tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS') : row.ord_validtill,
          refNo: row.ord_refno,
          type: row.ordt_name,
          paymentTerm: row.pyt_name,
          createdBy: row.usr_id,
          company: {
            name: row.bnc_name,
            altName: row.bnc_altname,
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
          },
          client: {
            name: row.cli_name,
            altName: row.cli_altname,
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
          },
          items: await getItems(row.ord_id),
          netAmount,
          totalTax,
          qrCodeData,
        };
      })
    );
    res.status(200).json(data);
  }
};

const createInvoice = async (req, res) => {
  const { id } = req.user;
  const { error, value } = Joi.object({
    validTillNoDays: Joi.number().min(0).max(60).required(),
    refNo: Joi.string().trim().min(0).max(30).required(),
    paymentTermId: Joi.string().trim().max(10).required(),
    branchId: Joi.string().trim().max(10).required(),
    clientId: Joi.string().trim().max(10).required(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().trim().max(10).required(),
          vatPercentageId: Joi.string().trim().max(10).required(),
          sellingPrice: Joi.number().precision(2).required(),
          discountPrice: Joi.number().precision(4).required(),
          quantity: Joi.number().greater(0).required(),
        })
      )
      .min(1)
      .required(),
  }).validate(req.body);

  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  const { refNo, paymentTermId, branchId, clientId, items } = value;

  const currentYear = moment().tz('Asia/Riyadh').format('YYYY');

  const orderCreationResult = await db.query(
    `INSERT INTO tblorders(usr_id, ord_no, ord_refno, ordt_id, bnc_id, cli_id, pyt_id) VALUES ($1, concat('INV-',$2::text,'-',RIGHT('00000'||(nextval('invoice_no_seq'::regclass)),5)), $3, '1', $4, $5, $6) RETURNING ord_id`,
    [id, currentYear, refNo, branchId, clientId, paymentTermId]
  );
  if (orderCreationResult.rowCount === 1) {
    const orderId = orderCreationResult.rows[0].ord_id;
    items.forEach(async (item) => {
      const { productId, vatPercentageId, sellingPrice, discountPrice, quantity } = item;

      const inventoriesResults = await db.query(
        'SELECT inv_id, inv_quantityleft FROM tblinventories INNER JOIN tblpurchaseorders ON tblpurchaseorders.por_id = tblinventories.por_id WHERE pro_id=$1 AND bnc_id=$2 AND inv_quantityleft > 0 AND inv_isdeleted = false ORDER BY inv_id',
        [productId, branchId]
      );

      if (inventoriesResults.rowCount) {
        const inventoriesTotal = inventoriesResults.rows?.reduce(
          (partialSum, inventory) => partialSum + Number(inventory?.inv_quantityleft ?? 0),
          0
        );

        if (quantity <= inventoriesTotal) {
          const orderItemResults = await db.query(
            'INSERT INTO tblorderitems(ordi_addedby, ord_id, ordi_sellingpriceperitem, ordi_discountpriceperitem, ordi_quantity, pro_id, vatp_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, orderId, sellingPrice, discountPrice, quantity, productId, vatPercentageId]
          );

          let remainingQty = quantity;
          let i = 0;
          while (inventoriesResults.rows[i] && remainingQty > 0) {
            if (remainingQty >= inventoriesResults.rows[i].inv_quantityleft) {
              await db.query('UPDATE tblinventories SET inv_quantityleft=$2 WHERE inv_id=$1', [inventoriesResults.rows[i].inv_id, 0]);
              await db.query('INSERT INTO tblorderinventories(orin_quantity, ordi_id, inv_id) VALUES ($1, $2, $3)', [
                inventoriesResults.rows[i].inv_quantityleft,
                orderItemResults.rows[0].ordi_id,
                inventoriesResults.rows[i].inv_id,
              ]);
              remainingQty = remainingQty - inventoriesResults.rows[i].inv_quantityleft;
            } else {
              await db.query('UPDATE tblinventories SET inv_quantityleft=$2 WHERE inv_id=$1', [
                inventoriesResults.rows[i].inv_id,
                inventoriesResults.rows[i].inv_quantityleft - remainingQty,
              ]);
              await db.query('INSERT INTO tblorderinventories(orin_quantity, ordi_id, inv_id) VALUES ($1, $2, $3)', [
                remainingQty,
                orderItemResults.rows[0].ordi_id,
                inventoriesResults.rows[i].inv_id,
              ]);
              remainingQty = 0;
            }
            i++;
          }
        } else if (quantity > inventoriesTotal) {
          const orderItemResults = await db.query(
            'INSERT INTO tblorderitems(ordi_addedby, ord_id, ordi_sellingpriceperitem, ordi_discountpriceperitem, ordi_quantity, pro_id, vatp_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, orderId, sellingPrice, discountPrice, inventoriesTotal, productId, vatPercentageId]
          );

          let remainingQty = inventoriesTotal;
          let i = 0;
          while (inventoriesResults.rows[i] && remainingQty > 0) {
            if (remainingQty >= inventoriesResults.rows[i].inv_quantityleft) {
              await db.query('UPDATE tblinventories SET inv_quantityleft=$2 WHERE inv_id=$1', [inventoriesResults.rows[i].inv_id, 0]);
              await db.query('INSERT INTO tblorderinventories(orin_quantity, ordi_id, inv_id) VALUES ($1, $2, $3)', [
                inventoriesResults.rows[i].inv_quantityleft,
                orderItemResults.rows[0].ordi_id,
                inventoriesResults.rows[i].inv_id,
              ]);
              remainingQty = remainingQty - inventoriesResults.rows[i].inv_quantityleft;
            } else {
              await db.query('UPDATE tblinventories SET inv_quantityleft=$2 WHERE inv_id=$1', [
                inventoriesResults.rows[i].inv_id,
                inventoriesResults.rows[i].inv_quantityleft - remainingQty,
              ]);
              await db.query('INSERT INTO tblorderinventories(orin_quantity, ordi_id, inv_id) VALUES ($1, $2, $3)', [
                remainingQty,
                orderItemResults.rows[0].ordi_id,
                inventoriesResults.rows[i].inv_id,
              ]);
              remainingQty = 0;
            }
            i++;
          }
        }
      }
    });
    return res.status(200).json({ message: 'Invoice created successfully.' });
  }
};

const updateInvoicebyId = async (req, res) => {};
const deleteInvoicebyId = async (req, res) => {};

module.exports = {
  getAllInvoices,
  createInvoice,
  updateInvoicebyId,
  deleteInvoicebyId,
};
