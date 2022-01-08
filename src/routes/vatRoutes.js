const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllVATs,
  createVAT,
  updateVATbyId,
  deleteVATbyId,
} = require('../controllers/vatController');

router.get('/', async(getAllVATs));
router.post('/', async(createVAT));
router.put('/:id', async(updateVATbyId));
// router.delete('/:id', isAdmin, async(deleteVATbyId));

module.exports = router;
