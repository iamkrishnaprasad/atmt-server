const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getActiveProducts,
  getAllProducts,
  getActiveProductsbySearch,
  getAllProductsbySearch,
  createProduct,
  updateProductbyId,
  deleteProductbyId,
} = require('../controllers/productController');

router.get('/', async(getActiveProducts));
router.get('/all', async(getAllProducts));
router.get('/search', async(getActiveProductsbySearch));
router.get('/search/all', async(getAllProductsbySearch));
router.post('/', async(createProduct));
router.put('/:id', isAdmin, async(updateProductbyId));
// router.delete('/:id', isAdmin, async(deleteProductbyId));

module.exports = router;
