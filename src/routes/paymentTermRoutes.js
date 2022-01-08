const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllPaymentTerms,
  createPaymentTerm,
  updatePaymentTermbyId,
  deletePaymentTermbyId,
} = require('../controllers/paymentTermController');

router.get('/', async(getAllPaymentTerms));
router.post('/', async(createPaymentTerm));
router.put('/:id', async(updatePaymentTermbyId));
// router.delete('/:id', isAdmin, async(deletePaymentTermbyId));

module.exports = router;
