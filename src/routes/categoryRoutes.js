const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllCategories,
  createCategory,
  updateCategorybyId,
  deleteCategorybyId,
} = require('../controllers/categoryController');

router.get('/', async(getAllCategories));
router.post('/', async(createCategory));
router.put('/:id', async(updateCategorybyId));
// router.delete('/:id', isAdmin, async(deleteCategorybyId));

module.exports = router;
