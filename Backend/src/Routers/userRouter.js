const router = require('express').Router();
const auth = require('../Middleware/auth');
const admin = require('../Middleware/admin');
// const logger = require('../../Middleware/logger');

const userController = require('../controllers/userContoller');
const orderController = require('../controllers/orderController');

router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/categories', userController.getAllCategories);
router.get('/Homeproducts', userController.getAllHomeProducts);
router.get('/:id/dashboard', auth, userController.getDashboard);

router.post('/admin/products', auth, admin, userController.createProduct);
router.put('/admin/products/:id', auth, admin, userController.updateProduct);
router.delete('/admin/products/:id', auth, admin, userController.deleteProduct);

router.post('/admin/categories', auth, admin, userController.createCategory);
router.put('/admin/categories/:id', auth, admin, userController.updateCategory);
router.delete('/admin/categories/:id', auth, admin, userController.deleteCategory);

router.post('/admin/brands', auth, admin, userController.createBrand);
router.put('/admin/brands/:id', auth, admin, userController.updateBrand);
router.delete('/admin/brands/:id', auth, admin, userController.deleteBrand);

router.post('/orders', auth, orderController.createOrder);
router.get('/orders', auth, orderController.getUserOrders);
router.get('/orders/:id', auth, orderController.getOrderById);
router.put('/orders/:id/cancel', auth, orderController.cancelOrder);
router.get('/orders/:id/track', auth, orderController.trackOrder);

module.exports = router;