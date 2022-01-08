const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllUserRoles,
  createUserRole,
  updateUserRolebyId,
  deleteUserRolebyId,
} = require('../controllers/userRoleController');

router.get('/', async(getAllUserRoles));
router.post('/', async(createUserRole));
router.put('/:id', async(updateUserRolebyId));
// router.delete('/:id', isAdmin, async(deleteUserRolebyId));

module.exports = router;
