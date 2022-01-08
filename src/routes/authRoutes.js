const router = require('express').Router();

const async = require('../middleware/async');

const { login } = require('../controllers/authController');

router.post('/', async(login));

module.exports = router;
