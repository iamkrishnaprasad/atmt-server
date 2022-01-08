const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllOrderItemStatuses,
  createOrderitemStatus,
  updateOrderItemStatusbyId,
  deleteOrderItemStatusbyId,
} = require('../controllers/orderItemStatusController');

router.get('/', async(getAllOrderItemStatuses));
router.post('/', async(createOrderitemStatus));
router.put('/:id', async(updateOrderItemStatusbyId));
// router.delete('/:id', isAdmin, async(deleteOrderItemStatusbyId));

module.exports = router;
