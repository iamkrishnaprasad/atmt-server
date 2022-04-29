const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getProducts,
  getProductsbySearch,
  createProduct,
  updateProductbyId,
  deleteProductbyId,
} = require('../controllers/productController');

router.get('/all', async(getProducts));
router.post('/', async(createProduct));
router.post('/search', async(getProductsbySearch));
router.put('/:id', isAdmin, async(updateProductbyId));
// router.delete('/:id', isAdmin, async(deleteProductbyId));

module.exports = router;
