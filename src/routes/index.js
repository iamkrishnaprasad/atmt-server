const router = require('express').Router();

// Middleware's
const auth = require('../middleware/auth');
const isActive = require('../middleware/isActive');

// Routes
router.use('/auth', require('./authRoutes'));
router.use('/branches', [auth, isActive], require('./branchRoutes'));
router.use('/userroles', [auth, isActive], require('./userRoleRoutes'));
router.use('/users', [auth, isActive], require('./userRoutes'));
router.use('/vatpercentages', [auth, isActive], require('./vatPercentageRoutes'));
router.use('/brands', [auth, isActive], require('./brandRoutes'));
router.use('/categories', [auth, isActive], require('./categoryRoutes'));
router.use('/unittypes', [auth, isActive], require('./unitTypeRoutes'));
router.use('/products', [auth, isActive], require('./productRoutes'));
router.use('/vendors', [auth, isActive], require('./vendorRoutes'));
router.use('/order/purchases/', [auth, isActive], require('./purchasesRoutes'));
// router.use('/order/purchases/return');
router.use('/paymentterms', [auth, isActive], require('./paymentTermRoutes'));
// router.use('/orderstatuses', [auth, isActive], require('./orderStatusRoutes'));
// router.use('/orderitemstatuses', [auth, isActive], require('./orderItemStatusRoutes'));

router.use('/clients', [auth, isActive], require('./clientRoutes'));

module.exports = router;
