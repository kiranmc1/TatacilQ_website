const router = require('express').Router();
const auth = require('../Middleware/auth');
// const logger = require('../../Middleware/logger');
// const validateuserid = require('../Middleware/validateUser');
const userController = require('../controllers/userContoller');

router.post('/login', userController.login);
router.get('/categories', userController.getAllCategories);
router.get('/:id/dashboard', auth, userController.getDashboard);


module.exports = router;