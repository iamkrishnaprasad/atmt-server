const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const {
  getAllUsers,
  getUserbyId,
  createUser,
  updateUserbyAdmin,
  updateProfile,
  updatePasswordbyAdmin,
  updatePasswordbyUser,
  deleteUserbyId,
} = require('../controllers/userController');

// Get all Users
router.get('/', async(getAllUsers));

// Get one User
router.get('/me', async(getUserbyId));

// Create User
router.post('/', async(createUser));

// Update User by Admin
router.put('/profile/:id', isAdmin, async(updateUserbyAdmin));

// Update User by User
router.put('/profile', async(updateProfile));

// Update Password by Admin
router.put('/password/:id', isAdmin, async(updatePasswordbyAdmin));

// Update Password by User
router.put('/password', async(updatePasswordbyUser));

// Delete User
// router.delete('/:id', isAdmin, async(deleteUserbyId));

module.exports = router;
