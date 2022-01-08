const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllOrderStatuses,
  createOrderStatus,
  updateOrderStatusbyId,
  deleteOrderStatusbyId,
} = require('../controllers/orderStatusController');

router.get('/', async(getAllOrderStatuses));
router.post('/', async(createOrderStatus));
router.put('/:id', async(updateOrderStatusbyId));
// router.delete('/:id', isAdmin, async(deleteOrderStatusbyId));

module.exports = router;
