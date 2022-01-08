const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllPurchaseOrders,
  getPurchaseOrderbyId,
  createPurchaseOrder,
  updatePurchaseOrderbyId,
  deletePurchaseOrderbyId,
} = require('../controllers/purchaseController');

router.get('/', async(getAllPurchaseOrders));
router.get('/:id', async(getPurchaseOrderbyId));
router.post('/', async(createPurchaseOrder));
router.put('/:id', async(updatePurchaseOrderbyId));
// router.delete('/:id', isAdmin, async(deletePurchaseOrderbyId));

module.exports = router;
