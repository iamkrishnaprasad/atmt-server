const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const { getAllInvoices, createInvoice, updateInvoicebyId, deleteInvoicebyId } = require('../controllers/invoiceController');

router.get('/', async(getAllInvoices));
router.post('/', async(createInvoice));
// router.put('/:id', async(updateInvoicebyId));
// router.delete('/:id', isAdmin, async(deleteInvoicebyId));

module.exports = router;
