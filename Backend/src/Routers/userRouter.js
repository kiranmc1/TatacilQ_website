const router = require('express').Router();
const auth = require('../Middleware/auth');
const admin = require('../Middleware/admin');
const vendor = require('../Middleware/vendor');

const userController = require('../controllers/userContoller');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/categories', userController.getAllCategories);
router.get('/brands', userController.getAllBrands);
router.get('/Homeproducts', userController.getAllHomeProducts);
router.get('/products', userController.getProducts);
router.get('/products/:id', userController.getProductById);
router.get('/me', auth, userController.getMe);
router.put('/me/address', auth, userController.updateAddress);
router.get('/:id/dashboard', auth, userController.getDashboard);

router.post('/payments/create-checkout-session', auth, paymentController.createCheckoutSession);
router.get('/payments/checkout-session/:sessionId', paymentController.getCheckoutSession);
router.post('/payments/webhook', paymentController.handleWebhook);

router.post('/admin/products', auth, admin, userController.createProduct);
router.put('/admin/products/:id', auth, admin, userController.updateProduct);
router.delete('/admin/products/:id', auth, admin, userController.deleteProduct);
router.get('/admin/vendor-products', auth, admin, userController.getPendingVendorProducts);
router.patch('/admin/vendor-products/:id/approve', auth, admin, userController.approveVendorProduct);

router.post('/vendor/products', auth, vendor, userController.submitVendorProduct);
router.get('/vendor/products', auth, vendor, userController.getVendorProducts);
router.put('/vendor/products/:id', auth, vendor, userController.updateProduct);
router.delete('/vendor/products/:id', auth, vendor, userController.deleteProduct);

router.post('/orders', auth, orderController.createOrder);
router.get('/orders', auth, orderController.getUserOrders);
router.get('/orders/:id', auth, orderController.getOrderById);
router.put('/orders/:id/cancel', auth, orderController.cancelOrder);
router.get('/orders/:id/track', auth, orderController.trackOrder);

router.post('/admin/categories', auth, admin, userController.createCategory);
router.put('/admin/categories/:id', auth, admin, userController.updateCategory);
router.delete('/admin/categories/:id', auth, admin, userController.deleteCategory);

router.post('/admin/brands', auth, admin, userController.createBrand);
router.put('/admin/brands/:id', auth, admin, userController.updateBrand);
router.delete('/admin/brands/:id', auth, admin, userController.deleteBrand);

module.exports = router;
