const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllVendors,
  getAllVendorsbySearch,
  createVendor,
  updateVendorbyId,
  deleteVendorbyId,
} = require('../controllers/vendorController');

router.get('/', async(getAllVendors));
router.get('/search', async(getAllVendorsbySearch));
router.post('/', async(createVendor));
router.put('/:id', async(updateVendorbyId));
// router.delete('/:id', isAdmin, async(deleteVendorbyId));

module.exports = router;
