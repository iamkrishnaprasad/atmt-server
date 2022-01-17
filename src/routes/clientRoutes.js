const router = require('express').Router();

const isAdmin = require('../middleware/isAdmin');
const async = require('../middleware/async');

const { getAllClients, searchClientbyVATNo, createClient, updateClientbyId, deleteClientbyId } = require('../controllers/clientController');

router.get('/', async(getAllClients));
router.get('/search', async(searchClientbyVATNo));
router.post('/', async(createClient));
router.put('/:id', async(updateClientbyId));
// router.delete('/:id', isAdmin, async(deleteClientbyId));

module.exports = router;
