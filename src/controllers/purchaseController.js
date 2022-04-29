const Joi = require('joi');
const db = require('../db');
const moment = require('moment-timezone');

const prepInventoriesList = (data) => {
  /* eslint-disable camelcase */
  const { inv_id, pro_id, inv_quantitybought, inv_discountprice, inv_vatonnetprice, inv_netprice } = data;

  return {
    id: inv_id,
    productId: pro_id,
    quantity: Number(inv_quantitybought),
    totalDiscountPricePerItem: (inv_discountprice * inv_quantitybought).toFixed(4),
    totalVATOnNetPricePerItem: (inv_vatonnetprice * inv_quantitybought).toFixed(2),
    totalNetPricePerItem: (
      (Number(inv_netprice) + Number(inv_vatonnetprice) - Number(inv_discountprice)) *
      Number(inv_quantitybought)
    ).toFixed(2),
  };
  /* eslint-enable camelcase */
};

const createPurchaseOrder = async (req, res) => {
  const { id } = req.user;
  const { error, value } = Joi.object({
    branchId: Joi.string().trim().max(10).required(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().trim().max(10).required(),
          quantity: Joi.number().greater(0).required(),
          totalAmount: Joi.number().precision(2).required(),
          totalDiscountAmount: Joi.number().precision(4).required(),
          totalTaxAmount: Joi.number().precision(2).required(),
        })
      )
      .min(1)
      .required(),
    paymentTermId: Joi.string().trim().max(10).required(),
    purchasedOn: Joi.date().required(),
    refNo: Joi.string().trim().min(0).max(30).required(),
    vendorId: Joi.string().trim().max(10).required(),
  }).validate(req.body);

  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }

  const { branchId, items, paymentTermId, purchasedOn, refNo, vendorId } = value;
  const currentYear = moment().tz('Asia/Riyadh').format('YYYY');

  const purchaseOrderCreationResult = await db.query(
    `INSERT INTO tblpurchaseorders(usr_id, por_no, por_purchasedon, por_refno, ven_id, pyt_id, bnc_id) VALUES ($1, concat('PO-',$2::text,'-',RIGHT('00000'||(currval('tblpurchaseorders_por_id_seq'::regclass)),5)), $3, $4, $5, $6, $7) RETURNING *`,
    [id, currentYear, purchasedOn, refNo, vendorId, paymentTermId, branchId]
  );

  let result = null;

  if (purchaseOrderCreationResult.rowCount === 1) {
    /* eslint-disable camelcase */
    const { por_id, por_no, por_purchasedon, por_refno, ven_id, pyt_id, bnc_id, por_created_at, usr_id } =
      purchaseOrderCreationResult.rows[0];
    result = {
      id: por_id,
      no: por_no,
      purchasedOn: moment(por_purchasedon).tz('Asia/Riyadh').format('YYYY-MM-DD'),
      refNo: por_refno,
      vendorId: ven_id,
      paymentTermId: pyt_id,
      branchId: bnc_id,
      createdAt: moment(por_created_at).tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS'),
      createdBy: usr_id,
    };

    const data = await Promise.all(
      items.map(async (item) => {
        const { productId, quantity, totalAmount, totalDiscountAmount, totalTaxAmount } = item;
        const discountPrice = (totalDiscountAmount / quantity).toFixed(4);
        const vatOnNetPrice = (totalTaxAmount / quantity).toFixed(4);
        const netPrice = ((totalDiscountAmount + totalAmount - totalTaxAmount) / quantity).toFixed(4);

        const inventoryResult = await db.query(
          'INSERT INTO tblinventories(por_id, pro_id, inv_quantityleft, inv_quantitybought, inv_discountprice, inv_vatonnetprice, inv_netprice) VALUES ($1, $2, $3, $3, $4, $5, $6) RETURNING *',
          [por_id, productId, quantity, discountPrice, vatOnNetPrice, netPrice]
        );

        return prepInventoriesList(inventoryResult.rows[0]);
      })
    );
    result = { ...result, inventories: [...data] };
  }
  return res.status(201).json({ data: result, message: 'Purchase order created successfully.' });
  /* eslint-enable camelcase */
};

const getInventories = async (purchaseOrderId) => {
  const inventoriesResult = await db.query(
    `SELECT inv_id, pro_id, inv_quantitybought, inv_discountprice, inv_vatonnetprice, inv_netprice FROM tblinventories WHERE inv_isdeleted=false AND por_id=$1 ORDER BY inv_id`,
    [purchaseOrderId]
  );
  return inventoriesResult.rows.map((row) => {
    /* eslint-disable camelcase */
    const { inv_id, pro_id, inv_quantitybought, inv_discountprice, inv_vatonnetprice, inv_netprice } = row;
    return {
      id: inv_id,
      productId: pro_id,
      quantity: Number(inv_quantitybought),
      totalDiscountPricePerItem: (inv_discountprice * inv_quantitybought).toFixed(4),
      totalVATOnNetPricePerItem: (inv_vatonnetprice * inv_quantitybought).toFixed(2),
      totalNetPricePerItem: (
        (Number(inv_netprice) + Number(inv_vatonnetprice) - Number(inv_discountprice)) *
        Number(inv_quantitybought)
      ).toFixed(2),
    };
    /* eslint-enable camelcase */
  });
};

const getAllPurchaseOrders = async (req, res) => {
  const results = await db.query(
    'SELECT por_id, por_no, por_purchasedon, por_refno, por_created_at, ven_id, pyt_id, bnc_id, usr_id FROM tblpurchaseorders WHERE por_isdeleted=false ORDER BY por_id DESC'
  );
  if (results.rowCount > 0) {
    const data = await Promise.all(
      results.rows.map(async (row) => {
        return {
          id: row.por_id,
          no: row.por_no,
          purchasedOn: moment(row.por_purchasedon).tz('Asia/Riyadh').format('YYYY-MM-DD'),
          refNo: row.por_refno,
          vendorId: row.ven_id,
          paymentTermId: row.pyt_id,
          branchId: row.bnc_id,
          createdAt: moment(row.por_created_at).tz('Asia/Riyadh').format('YYYY-MM-DDTHH:mm:ss.SSS'),
          createdBy: row.usr_id,
          inventories: await getInventories(row.por_id),
        };
      })
    );
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: 'Data not available.' });
  }
};

const getPurchaseOrderbyId = async (req, res) => {};
const updatePurchaseOrderbyId = async (req, res) => {};
const deletePurchaseOrderbyId = async (req, res) => {};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderbyId,
  createPurchaseOrder,
  updatePurchaseOrderbyId,
  deletePurchaseOrderbyId,
};
