const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllBranches,
  createBranch,
  updateBranchbyId,
  deleteBranchbyId,
} = require('../controllers/branchController');

router.get('/', async(getAllBranches));
router.post('/', async(createBranch));
router.put('/:id', async(updateBranchbyId));
// router.delete('/:id', isAdmin, async(deleteBranchbyId));

module.exports = router;
