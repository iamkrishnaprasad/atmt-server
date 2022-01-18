const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllVATPercentages,
  createVATPercentage,
  updateVATPercentagebyId,
  deleteVATPercentagebyId,
} = require('../controllers/vatPercentageController');

router.get('/', async(getAllVATPercentages));
router.post('/', async(createVATPercentage));
router.put('/:id', async(updateVATPercentagebyId));
// router.delete('/:id', isAdmin, async(deleteVATPercentagebyId));

module.exports = router;
