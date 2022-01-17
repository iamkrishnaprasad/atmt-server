const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const { getAllUnitTypes, createUnitType, updateUnitTypebyId, deleteUnitTypebyId } = require('../controllers/unitTypeController');

router.get('/', async(getAllUnitTypes));
router.post('/', async(createUnitType));
router.put('/:id', async(updateUnitTypebyId));
// router.delete('/:id', isAdmin, async(deleteUnitTypebyId));

module.exports = router;
