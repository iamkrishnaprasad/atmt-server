const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllBrands,
  createBrand,
  updateBrandbyId,
  deleteBrandbyId,
} = require('../controllers/brandController');

router.get('/', async(getAllBrands));
router.post('/', async(createBrand));
router.put('/:id', async(updateBrandbyId));
// router.delete('/:id', isAdmin, async(deleteBrandbyId));

module.exports = router;
